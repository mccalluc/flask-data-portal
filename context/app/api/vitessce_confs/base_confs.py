import urllib
from pathlib import Path
import re
from collections import namedtuple

from flask import current_app
from vitessce import (
    VitessceConfig,
    MultiImageWrapper,
    OmeTiffWrapper,
    AnnDataWrapper,
    Component as cm,
    DataType as dt,
    FileType as ft,
)

from .utils import get_matches
from .paths import SPRM_JSON_DIR, IMAGE_PYRAMID_DIR, OFFSETS_DIR, SPRM_PYRAMID_DIR

MOCK_URL = "https://example.com"


ConfCells = namedtuple('ConfCells', ['conf', 'cells'])


class NullViewConfBuilder():

    def get_conf_cells(self):
        return ConfCells(None, None)


class ViewConfBuilder:
    def __init__(self, entity=None, groups_token=None, is_mock=False):
        """Object for building the vitessce configuration.
        :param dict entity: Entity response from search index (from the entity API)
        :param str groups_token: Groups token for use in authenticating API
        :param bool is_mock: Wether or not this class is being mocked.

        >>> vc = ViewConfBuilder(
        ...     entity={"uuid": "uuid"}, groups_token='groups_token', is_mock=True)

        """

        self._uuid = entity["uuid"]
        self._groups_token = groups_token
        self._entity = entity
        self._is_mock = is_mock
        self._files = []

    def get_conf_cells(self):
        raise NotImplementedError

    def _replace_url_in_file(self, file):
        """Replace url in incoming file object
        :param dict file: File dict which will have its rel_path replaced by url
        :rtype: dict The file with rel_path replaced by url
        >>> from pprint import pprint
        >>> vc = ViewConfBuilder(
        ...     entity={"uuid": "uuid"}, groups_token='groups_token', is_mock=True)
        >>> file = { 'data_type': 'CELLS', 'file_type': 'cells.json', 'rel_path': 'cells.json' }
        >>> pprint(vc._replace_url_in_file(file))
        {'data_type': 'CELLS',\n\
         'file_type': 'cells.json',\n\
         'url': 'https://example.com/uuid/cells.json?token=groups_token'}
        """

        return {
            "data_type": file["data_type"],
            "file_type": file["file_type"],
            "url": self._build_assets_url(file["rel_path"]),
        }

    def _build_assets_url(self, rel_path, use_token=True):
        """Create a url for an asset.
        :param str rel_path: The path off of which the url should be built
        :param bool use_token: Whether or not to append a groups token to the URL, default True
        :rtype: dict The file with rel_path replaced by url

        >>> vc = ViewConfBuilder(
        ...     entity={"uuid": "uuid"}, groups_token='groups_token', is_mock=True)
        >>> vc._build_assets_url("rel_path/to/clusters.ome.tiff")
        'https://example.com/uuid/rel_path/to/clusters.ome.tiff?token=groups_token'

        """
        if not self._is_mock:
            assets_endpoint = current_app.config["ASSETS_ENDPOINT"]
        else:
            assets_endpoint = MOCK_URL
        base_url = urllib.parse.urljoin(assets_endpoint, f"{self._uuid}/{rel_path}")
        token_param = urllib.parse.urlencode({"token": self._groups_token})
        return f"{base_url}?{token_param}" if use_token else base_url

    def _get_request_init(self):
        """Get request headers for requestInit parameter in Vitessce conf.
        This is needed for non-public zarr stores because the client forms URLs for zarr chunks,
        not the above _build_assets_url function.

        >>> entity = {"uuid": "uuid", "status": "QA"}
        >>> vc = ViewConfBuilder(entity=entity, groups_token='groups_token', is_mock=True)
        >>> vc._get_request_init()
        {'headers': {'Authorization': 'Bearer groups_token'}}
        >>> entity = {"uuid": "uuid", "status": "Published"}
        >>> vc = ViewConfBuilder(entity=entity, groups_token='groups_token', is_mock=True)
        >>> assert vc._get_request_init() is None # None because dataset is Published (public)
        """
        request_init = {"headers": {"Authorization": f"Bearer {self._groups_token}"}}
        # Extra headers outside of a select few cause extra CORS-preflight requests which
        # can slow down the webpage.  If the dataset is published, we don't need to use
        # heaeder to authenticate access to the assets API.
        # See: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#simple_requests
        use_request_init = False if self._entity["status"] == "Published" else True
        return request_init if use_request_init else None

    def _get_file_paths(self):
        """Get all rel_path keys from the entity dict.

        >>> files = [{ "rel_path": "path/to/file" }, { "rel_path": "path/to/other_file" }]
        >>> entity = {"uuid": "uuid", "files": files}
        >>> vc = ViewConfBuilder(entity=entity, groups_token='groups_token', is_mock=True)
        >>> vc._get_file_paths()
        ['path/to/file', 'path/to/other_file']
        """
        return [file["rel_path"] for file in self._entity["files"]]


class AbstractImagingViewConfBuilder(ViewConfBuilder):
    def _get_img_and_offset_url(self, img_path, img_dir):
        """Create a url for the offsets and img.
        :param str img_path: The path of the image
        :param str img_dir: The image-specific part of the path to be
        replaced by the OFFSETS_DIR constant.
        :rtype: tuple The image url and the offsets url

        >>> from pprint import pprint
        >>> vc = AbstractImagingViewConfBuilder(entity={ "uuid": "uuid" },\
            groups_token='groups_token', is_mock=True)
        >>> pprint(vc._get_img_and_offset_url("rel_path/to/clusters.ome.tiff",\
            "rel_path/to"))
        ('https://example.com/uuid/rel_path/to/clusters.ome.tiff?token=groups_token',\n\
         'https://example.com/uuid/output_offsets/clusters.offsets.json?token=groups_token')

        """
        img_url = self._build_assets_url(img_path)
        return (
            img_url,
            str(
                re.sub(
                    r"ome\.tiff?",
                    "offsets.json",
                    re.sub(img_dir, OFFSETS_DIR, img_url),
                )
            ),
        )

    def _setup_view_config_raster(self, vc, dataset, disable_3d=[]):
        vc.add_view(dataset, cm.SPATIAL, x=3, y=0, w=9, h=12)
        vc.add_view(dataset, cm.DESCRIPTION, x=0, y=8, w=3, h=4)
        vc.add_view(dataset, cm.LAYER_CONTROLLER, x=0, y=0, w=3, h=8).set_props(
            disable3d=disable_3d
        )
        return vc


class ImagePyramidViewConfBuilder(AbstractImagingViewConfBuilder):
    def __init__(self, entity, groups_token, is_mock=False):
        """Wrapper class for creating a standard view configuration for image pyramids,
        i.e for high resolution viz-lifted imaging datasets like
        https://portal.hubmapconsortium.org/browse/dataset/dc289471333309925e46ceb9bafafaf4
        """
        self.image_pyramid_regex = IMAGE_PYRAMID_DIR
        super().__init__(entity, groups_token, is_mock)

    def get_conf_cells(self):
        file_paths_found = self._get_file_paths()
        found_images = get_matches(
            file_paths_found, self.image_pyramid_regex + r".*\.ome\.tiff?$",
        )
        if len(found_images) == 0:
            message = (
                f"Image pyramid assay with uuid {self._uuid} has no matching files"
            )
            raise FileNotFoundError(message)

        vc = VitessceConfig(name="HuBMAP Data Portal")
        dataset = vc.add_dataset(name="Visualization Files")
        images = []
        for img_path in found_images:
            img_url, offsets_url = self._get_img_and_offset_url(
                img_path, self.image_pyramid_regex
            )
            images.append(
                OmeTiffWrapper(
                    img_url=img_url, offsets_url=offsets_url, name=Path(img_path).name
                )
            )
        dataset = dataset.add_object(MultiImageWrapper(images))
        vc = self._setup_view_config_raster(vc, dataset)
        conf = vc.to_dict()
        # Don't want to render all layers
        del conf["datasets"][0]["files"][0]["options"]["renderLayers"]
        return ConfCells(conf, None)


class AbstractScatterplotViewConfBuilder(ViewConfBuilder):
    """Base class for subclasses creating a JSON-backed scatterplot for
    "first generation" RNA-seq and ATAC-seq data like
    https://portal.hubmapconsortium.org/browse/dataset/d4493657cde29702c5ed73932da5317c
    from h5ad-to-arrow.cwl.
    """

    def get_conf_cells(self):
        file_paths_expected = [file["rel_path"] for file in self._files]
        file_paths_found = self._get_file_paths()
        # We need to check that the files we expect actually exist.
        # This is due to the volatility of the datasets.
        if not set(file_paths_expected).issubset(set(file_paths_found)):
            message = f'Files for uuid "{self._uuid}" not found as expected.'
            raise FileNotFoundError(message)
        vc = VitessceConfig(name="HuBMAP Data Portal")
        dataset = vc.add_dataset(name="Visualization Files")
        # The sublcass initializes _files in its __init__ method
        for file in self._files:
            dataset = dataset.add_file(**(self._replace_url_in_file(file)))
        vc = self._setup_scatterplot_view_config(vc, dataset)
        return ConfCells(vc.to_dict(), None)

    def _setup_scatterplot_view_config(self, vc, dataset):
        vc.add_view(dataset, cm.SCATTERPLOT, mapping="UMAP", x=0, y=0, w=9, h=12)
        vc.add_view(dataset, cm.CELL_SETS, x=9, y=0, w=3, h=12)
        return vc


class SPRMViewConfBuilder(ImagePyramidViewConfBuilder):
    """Base class with shared methods for different SPRM subclasses,
    like SPRMJSONViewConfBuilder and SPRMAnnDataViewConfBuilder
    https://portal.hubmapconsortium.org/search?mapped_data_types[0]=CODEX%20%5BCytokit%20%2B%20SPRM%5D&entity_type[0]=Dataset
    """

    def _get_full_image_path(self):
        return f"{self._imaging_path_regex}/{self._image_name}.ome.tif(f?)"

    def _check_sprm_image(self, path_regex):
        """Check whether or not there is a matching SPRM image at a path.
        :param str path_regex: The path to look for the images
        :rtype: str The found image
        """
        file_paths_found = self._get_file_paths()
        found_image_files = get_matches(file_paths_found, path_regex)
        if len(found_image_files) != 1:
            message = f'Found {len(found_image_files)} image files for SPRM uuid "{self._uuid}".'
            raise FileNotFoundError(message)
        found_image_file = found_image_files[0]
        return found_image_file

    def _get_ometiff_image_wrapper(self, found_image_file, found_image_path):
        """Create a OmeTiffWrapper object for an image, including offsets.json after calling
        _get_img_and_offset_url on the arguments to this function.
        :param str found_image_file: The path to look for the image itself
        :param str found_image_path: The folder to be replaced with the offsets path
        """
        img_url, offsets_url = self._get_img_and_offset_url(
            found_image_file, re.escape(found_image_path),
        )
        return OmeTiffWrapper(
            img_url=img_url, offsets_url=offsets_url, name=self._image_name
        )


class SPRMJSONViewConfBuilder(SPRMViewConfBuilder):
    """Wrapper class for generating "first generation" non-stitched JSON-backed
    SPRM Vitessce configurations, like
    https://portal.hubmapconsortium.org/browse/dataset/dc31a6d06daa964299224e9c8d6cafb3
    """

    def __init__(self, entity, groups_token, is_mock=False, **kwargs):
        # All "file" Vitessce objects that do not have wrappers.
        super().__init__(entity, groups_token, is_mock)
        # These are both something like R001_X009_Y009 because
        # there is no mask used here or shared name with the mask data.
        self._base_name = kwargs["base_name"]
        self._image_name = kwargs["base_name"]
        self._imaging_path_regex = kwargs["imaging_path"]
        self._files = [
            {
                "rel_path": f"{SPRM_JSON_DIR}/" + f"{self._base_name}.cells.json",
                "file_type": ft.CELLS_JSON,
                "data_type": dt.CELLS,
            },
            {
                "rel_path": f"{SPRM_JSON_DIR}/" + f"{self._base_name}.cell-sets.json",
                "file_type": ft.CELL_SETS_JSON,
                "data_type": dt.CELL_SETS,
            },
            {
                "rel_path": f"{SPRM_JSON_DIR}/" + f"{self._base_name}.clusters.json",
                "file_type": "clusters.json",
                "data_type": dt.EXPRESSION_MATRIX,
            },
        ]

    def get_conf_cells(self):
        found_image_file = self._check_sprm_image(self._get_full_image_path())
        vc = VitessceConfig(name=self._base_name)
        dataset = vc.add_dataset(name="SPRM")
        image_wrapper = self._get_ometiff_image_wrapper(found_image_file, self._imaging_path_regex)
        dataset = dataset.add_object(image_wrapper)
        file_paths_found = self._get_file_paths()
        # This tile has no segmentations,
        # so only show Spatial component without cells sets, genes etc.
        if self._files[0]["rel_path"] not in file_paths_found:
            vc = self._setup_view_config_raster(vc, dataset, disable_3d=[self._image_name])
        # This tile has segmentations so show the analysis results.
        else:
            for file in self._files:
                path = file["rel_path"]
                if path not in file_paths_found:
                    message = f'SPRM file {path} with uuid "{self._uuid}" not found as expected.'
                    if not self._is_mock:
                        current_app.logger.error(message)
                    raise FileNotFoundError(message)
                dataset_file = self._replace_url_in_file(file)
                dataset = dataset.add_file(**(dataset_file))
            vc = self._setup_view_config_raster_cellsets_expression_segmentation(
                vc, dataset
            )
        return ConfCells(vc.to_dict(), None)

    def _setup_view_config_raster_cellsets_expression_segmentation(self, vc, dataset):
        vc.add_view(dataset, cm.SPATIAL, x=3, y=0, w=7, h=8)
        vc.add_view(dataset, cm.DESCRIPTION, x=0, y=8, w=3, h=4)
        vc.add_view(dataset, cm.LAYER_CONTROLLER, x=0, y=0, w=3, h=8).set_props(
            disable3d=[self._image_name]
        )
        vc.add_view(dataset, cm.CELL_SETS, x=10, y=5, w=2, h=7)
        vc.add_view(dataset, cm.GENES, x=10, y=0, w=2, h=5).set_props(
            variablesLabelOverride="antigen"
        )
        vc.add_view(dataset, cm.HEATMAP, x=3, y=8, w=7, h=4).set_props(
            transpose=True, variablesLabelOverride="antigen"
        )
        return vc


class SPRMAnnDataViewConfBuilder(SPRMViewConfBuilder):
    """Wrapper class for generating "second generation"
    stitched AnnData-backed SPRM Vitessce configurations,
    like the dataset derived from
    https://portal.hubmapconsortium.org/browse/dataset/1c33472c68c4fb40f531b39bf6310f2d

    :param \\*\\*kwargs: { imaging_path: str, mask_path: str } for the paths
    of the image and mask relative to image_pyramid_regex
    """

    def __init__(self, entity, groups_token, is_mock=False, **kwargs):
        super().__init__(entity, groups_token, is_mock)
        self._mask_name = kwargs["mask_name"]
        self._image_name = kwargs["image_name"]
        self._imaging_path_regex = f"{self.image_pyramid_regex}/{kwargs['imaging_path']}"
        self._mask_path_regex = f"{self.image_pyramid_regex}/{kwargs['mask_path']}"

    def _get_bitmask_image_path(self):
        return f"{self._mask_path_regex}/{self._mask_name}.ome.tiff?"

    def _get_ometiff_mask_wrapper(self, found_bitmask_file):
        bitmask_img_url, bitmask_offsets_url = self._get_img_and_offset_url(
            found_bitmask_file, self.image_pyramid_regex,
        )
        return OmeTiffWrapper(
            img_url=bitmask_img_url,
            offsets_url=bitmask_offsets_url,
            name=self._mask_name,
            is_bitmask=True
        )

    def get_conf_cells(self):
        vc = VitessceConfig(name=self._image_name)
        dataset = vc.add_dataset(name="SPRM")
        file_paths_found = self._get_file_paths()
        zarr_path = f"anndata-zarr/{self._image_name}-anndata.zarr"
        # Use the group as a proxy for presence of the rest of the zarr store.
        if f"{zarr_path}/.zgroup" not in file_paths_found:
            message = f"SPRM assay with uuid {self._uuid} has no .zarr store at {zarr_path}"
            raise FileNotFoundError(message)
        adata_url = self._build_assets_url(zarr_path, use_token=False)
        # https://github.com/hubmapconsortium/portal-containers/blob/master/containers/sprm-to-anndata
        # has information on how these keys are generated.
        obs_keys = [
            "Cell K-Means [tSNE_All_Features]",
            "Cell K-Means [Mean-All-SubRegions] Expression",
            "Cell K-Means [Mean] Expression",
            "Cell K-Means [Shape-Vectors]",
            "Cell K-Means [Texture]",
            "Cell K-Means [Total] Expression",
            "Cell K-Means [Covariance] Expression",
        ]
        anndata_wrapper = AnnDataWrapper(
            mappings_obsm=["tsne"],
            mappings_obsm_names=["t-SNE"],
            adata_url=adata_url,
            spatial_centroid_obsm="xy",
            cell_set_obs=obs_keys,
            expression_matrix="X",
            factors_obs=obs_keys,
            request_init=self._get_request_init(),
        )
        dataset = dataset.add_object(anndata_wrapper)
        found_image_file = self._check_sprm_image(self._get_full_image_path())
        image_wrapper = self._get_ometiff_image_wrapper(found_image_file, self.image_pyramid_regex)
        found_bitmask_file = self._check_sprm_image(self._get_bitmask_image_path())
        bitmask_wrapper = self._get_ometiff_mask_wrapper(found_bitmask_file)
        dataset = dataset.add_object(MultiImageWrapper([image_wrapper, bitmask_wrapper]))
        vc = self._setup_view_config_raster_cellsets_expression_segmentation(
            vc, dataset
        )
        return ConfCells(vc.to_dict(), None)

    def _setup_view_config_raster_cellsets_expression_segmentation(self, vc, dataset):
        vc.add_view(dataset, cm.SPATIAL, x=3, y=0, w=4, h=8)
        vc.add_view(dataset, cm.SCATTERPLOT, mapping="t-SNE", x=7, y=0, w=3, h=8)
        vc.add_view(dataset, cm.DESCRIPTION, x=0, y=8, w=3, h=4)
        vc.add_view(dataset, cm.LAYER_CONTROLLER, x=0, y=0, w=3, h=8)
        vc.add_view(dataset, cm.CELL_SETS, x=10, y=5, w=2, h=7)
        vc.add_view(dataset, cm.GENES, x=10, y=0, w=2, h=5).set_props(
            variablesLabelOverride="antigen"
        )
        vc.add_view(dataset, cm.HEATMAP, x=3, y=8, w=7, h=4).set_props(
            variablesLabelOverride="antigen", transpose=True
        )
        return vc


class MultiImageSPRMAnndataViewConfigError(Exception):
    """Raised when one of the individual SPRM view configs errors out"""
    pass


class MultiImageSPRMAnndataViewConfBuilder(ViewConfBuilder):
    """Wrapper class for generating multiple "second generation" AnnData-backed SPRM
    Vitessce configurations via SPRMAnnDataViewConfBuilder,
    used for datasets with multiple regions.
    """

    def __init__(self, entity, groups_token, is_mock=False):
        super().__init__(entity, groups_token, is_mock)
        self._expression_id = 'expr'
        self._mask_id = 'mask'
        self._image_pyramid_subdir_regex = SPRM_PYRAMID_DIR
        self._mask_pyramid_subdir_regex = SPRM_PYRAMID_DIR.replace(
            self._expression_id, self._mask_id
        )

    def _find_ids(self):
        """Search the image pyramid directory for all of the names of OME-TIFF files
        to use as unique identifiers.
        """
        file_paths_found = [file["rel_path"] for file in self._entity["files"]]
        full_pyramid_path = IMAGE_PYRAMID_DIR + "/" + self._image_pyramid_subdir_regex
        pyramid_files = [file for file in file_paths_found if full_pyramid_path in file]
        found_ids = [re.sub(r".ome.tif(f?)", "", Path(image_path).name).replace(
            "_" + self._expression_id, "") for image_path in pyramid_files]
        if len(found_ids) == 0:
            raise FileNotFoundError(
                f"Could not find images of the SPRM analysis with uuid {self._uuid}"
            )
        return found_ids

    def get_conf_cells(self):
        found_ids = self._find_ids()
        confs = []
        for id in sorted(found_ids):
            vc = SPRMAnnDataViewConfBuilder(
                entity=self._entity,
                groups_token=self._groups_token,
                is_mock=self._is_mock,
                base_name=id,
                imaging_path=self._image_pyramid_subdir_regex,
                mask_path=self._mask_pyramid_subdir_regex,
                image_name=f"{id}_{self._expression_id}",
                mask_name=f"{id}_{self._mask_id}"
            )
            conf = vc.get_conf_cells().conf
            if conf == {}:
                raise MultiImageSPRMAnndataViewConfigError(
                    f"Cytokit SPRM assay with uuid {self._uuid} has empty view\
                        config for id '{id}'"
                )
            confs.append(conf)
        return ConfCells(confs if len(confs) > 1 else confs[0], None)
