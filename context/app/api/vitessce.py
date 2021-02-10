import urllib
from pathlib import Path
import json
from datauri import DataURI
import re
import copy
from itertools import groupby

from flask import current_app
from vitessce import (
    VitessceConfig,
    MultiImageWrapper,
    OmeTiffWrapper,
    DataType as dt,
    FileType as ft,
    Component as cm,
    CoordinationType as ct,
)


def build_scatterplot_view_config(vc, dataset):
    umap = vc.add_view(dataset, cm.SCATTERPLOT, mapping="UMAP")
    cell_sets = vc.add_view(dataset, cm.CELL_SETS)
    vc.layout(umap | cell_sets)
    return vc


def build_basic_imaging_config(vc, dataset):
    spatial = vc.add_view(dataset, cm.SPATIAL)
    status = vc.add_view(dataset, cm.DESCRIPTION)
    lc = vc.add_view(dataset, cm.LAYER_CONTROLLER)
    vc.layout(spatial | (lc / status))
    return vc


def build_imaging_with_segmentation_and_clusters_config(vc, dataset):
    spatial = vc.add_view(dataset, cm.SPATIAL)
    description = vc.add_view(dataset, cm.DESCRIPTION)
    lc = vc.add_view(dataset, cm.LAYER_CONTROLLER)
    cell_sets = vc.add_view(dataset, cm.CELL_SETS)
    genes = vc.add_view(dataset, cm.GENES)
    heatmap = vc.add_view(dataset, cm.HEATMAP)
    vc.layout((lc / description) | (spatial / heatmap) | (genes / cell_sets))
    return vc


CODEX_CYTOKIT = "codex_cytokit"
IMAGE_PYRAMID = "image_pyramid"

SCRNA_SEQ_10X = "salmon_rnaseq_10x"
SCRNA_SEQ_SCI = "salmon_rnaseq_sciseq"
SCRNA_SEQ_SNARE = "salmon_rnaseq_snareseq"
SCRNA_SEQ_SN = "salmon_sn_rnaseq_10x"

SCATAC_SEQ_SCI = "sc_atac_seq_sci"
SCATAC_SEQ_SNARE = "sc_atac_seq_snare"
SCATAC_SEQ_SN = "sn_atac_seq"

SC_DATA_TYPES = [
    SCRNA_SEQ_10X,
    SCRNA_SEQ_SCI,
    SCRNA_SEQ_SNARE,
    SCRNA_SEQ_SN,
    SCATAC_SEQ_SCI,
    SCATAC_SEQ_SNARE,
    SCATAC_SEQ_SN,
]

SCRNA_SEQ_BASE_PATH = "cluster-marker-genes/output/cluster_marker_genes"
SCATAC_SEQ_BASE_PATH = "output"

OFFSETS_PATH = "output_offsets"
IMAGE_PYRAMID_PATH = "ometiff-pyramids"
CODEX_TILE_PATH = "output/extract/expressions/ome-tiff"
CODDEX_SPRM_PATH = "output_json"
TILE_REGEX = r"R\d+_X\d+_Y\d+"


# Hardcoded CODEX offsets and tile path.
IMAGING_PATHS = {
    CODEX_CYTOKIT: {"offsets": OFFSETS_PATH, "image": CODEX_TILE_PATH,},
    IMAGE_PYRAMID: {"offsets": OFFSETS_PATH, "image": IMAGE_PYRAMID_PATH,},
}

SEQFISH_HYB_CYCLE_REGEX = r"(HybCycle_\d+|final_mRNA_background)"
SEQFISH_NAME_REGEX = r"MMStack_Pos\d+\.ome\.tiff?"
SEQFISH_REGEX = f"{IMAGE_PYRAMID_PATH}/{SEQFISH_HYB_CYCLE_REGEX}/{SEQFISH_NAME_REGEX}"

SCRNA_SEQ_CONFIG = {
    "view_function": build_scatterplot_view_config,
    "files_conf": [
        {
            "rel_path": f"{SCRNA_SEQ_BASE_PATH}.cells.json",
            "file_type": ft.CELLS_JSON,
            "data_type": dt.CELLS,
        },
        {
            "rel_path": f"{SCRNA_SEQ_BASE_PATH}.cell-sets.json",
            "file_type": ft.CELL_SETS_JSON,
            "data_type": dt.CELL_SETS,
        },
    ],
}

SCATAC_SEQ_CONFIG = {
    "view_function": build_scatterplot_view_config,
    "files_conf": [
        {
            "rel_path": f"{SCATAC_SEQ_BASE_PATH}/umap_coords_clusters.cells.json",
            "file_type": ft.CELLS_JSON,
            "data_type": dt.CELLS,
        },
        {
            "rel_path": f"{SCATAC_SEQ_BASE_PATH}/umap_coords_clusters.cell-sets.json",
            "file_type": ft.CELL_SETS_JSON,
            "data_type": dt.CELL_SETS,
        },
    ],
}

ASSAY_CONF_LOOKUP = {
    SCRNA_SEQ_10X: SCRNA_SEQ_CONFIG,
    SCRNA_SEQ_SN: SCRNA_SEQ_CONFIG,
    SCRNA_SEQ_SCI: SCRNA_SEQ_CONFIG,
    SCRNA_SEQ_SNARE: SCRNA_SEQ_CONFIG,
    SCATAC_SEQ_SCI: SCATAC_SEQ_CONFIG,
    SCATAC_SEQ_SNARE: SCATAC_SEQ_CONFIG,
    SCATAC_SEQ_SN: SCATAC_SEQ_CONFIG,
    CODEX_CYTOKIT: {
        "view_function": build_imaging_with_segmentation_and_clusters_config,
        "files_conf": [
            {
                "rel_path": f"{CODEX_TILE_PATH}/{TILE_REGEX}.ome.tiff",
                "file_type": ft.RASTER_JSON,
                "data_type": dt.RASTER,
            },
            {
                "rel_path": f"{CODDEX_SPRM_PATH}/{TILE_REGEX}.cells.json",
                "file_type": ft.CELLS_JSON,
                "data_type": dt.CELLS,
            },
            {
                "rel_path": f"{CODDEX_SPRM_PATH}/{TILE_REGEX}.cell-sets.json",
                "file_type": ft.CELL_SETS_JSON,
                "data_type": dt.CELL_SETS,
            },
            {
                "rel_path": f"{CODDEX_SPRM_PATH}/{TILE_REGEX}.clusters.json",
                "file_type": "clusters.json",
                "data_type": dt.EXPRESSION_MATRIX,
            },
        ],
    },
    IMAGE_PYRAMID: {
        "view_function": build_basic_imaging_config,
        "files_conf": [
            {
                "rel_path": re.escape(IMAGE_PYRAMID_PATH) + r"/.*\.ome\.tiff?$",
                "file_type": ft.RASTER_JSON,
                "data_type": dt.RASTER,
            },
        ],
    },
}

IMAGE_ASSAYS = [CODEX_CYTOKIT, IMAGE_PYRAMID]
TILED_ASSAYS = [CODEX_CYTOKIT]

MOCK_URL = "https://example.com"


def _get_matches(files, regex):
    return list(
        set(
            [
                match[0]
                for match in set(re.search(regex, file) for file in files)
                if match
            ]
        )
    )


def _exclude_matches(files, regex):
    return list(set(file for file in files if not re.search(regex, file)))


def _get_path_name(file):
    return Path(file).name


def _group_by_file_name(files):
    sorted_files = sorted(files, key=_get_path_name)
    return [list(g) for _, g in groupby(sorted_files, _get_path_name)]


def _get_hybcycle(image):
    return re.search(SEQFISH_HYB_CYCLE_REGEX, image)[0]


def create_obj_routes(obj, dataset_uid, obj_i):
    """
    For a particular data object, simultaneously set up:

    * its server routes and their responses, and
    * the corresponding view config dataset file definitions

    :param obj: An object representing a single-cell data analysis result or microscopy image.
    :type obj: anndata.AnnData or loompy.LoomConnection or zarr.hierarchy.Group

    :returns: A list of view config file definitions and a list of server routes.
    :rtype: tuple[list[dict], list[starlette.routing.Route]]
    """
    obj_file_defs = []
    obj_routes = []
    base_url = ""
    for data_type in dt:
        try:
            dt_obj_file_defs, dt_obj_routes = obj._get_data(
                data_type, base_url, dataset_uid, obj_i
            )
            obj_file_defs += dt_obj_file_defs
            obj_routes += dt_obj_routes
        except NotImplementedError:
            pass

    return obj_file_defs, obj_routes


def on_obj(obj, dataset_uid, obj_i):
    obj_file_defs, obj_routes = create_obj_routes(obj, dataset_uid, obj_i)
    return obj_file_defs


class Vitessce:
    def __init__(self, entity=None, nexus_token=None, is_mock=False):
        """Object for building the vitessce configuration.

          >> vitessce = Vitessce(entity, nexus_token)

        """

        # Can there be more than one of these?  This seems like a fine default for now.
        self.assay_type = entity["data_types"][0]
        self.uuid = entity["uuid"]
        self.nexus_token = nexus_token
        self.is_mock = is_mock
        self.entity = entity
        self.conf = {}
        self._build_vitessce_conf()

    def _build_vitessce_conf(self):
        """Vuilding the vitessce configuration.

        >> vitessce = Vitessce(entity, nexus_token)
        >> vitessce.conf

        {
          'name': 'NAME',
          'layers': [
            {
              'name': 'raster',
              'type': 'RASTER',
              'url': DataURI('fjsdlfjasldfa')
            }
          ],
          'staticLayout': [
            {'component': 'layerController', 'x': 0, 'y': 0, 'w': 4, 'h': 6},
            {
                'component': 'spatial',
                'props': {
                    'view': {},
                },
                'x': 4,
                'y': 0,
                'w': 8,
                'h': 6,
            },
          ],
        }

        """
        if self.assay_type not in ASSAY_CONF_LOOKUP:
            return {}
        view_config_and_files = ASSAY_CONF_LOOKUP[self.assay_type]
        files = copy.deepcopy(view_config_and_files["files_conf"])
        file_paths_expected = [file["rel_path"] for file in files]
        file_paths_found = [file["rel_path"] for file in self.entity["files"]]
        view_function = view_config_and_files["view_function"]
        # Codex and other tiled assays needs to be built up based on their input tiles.
        if self.assay_type not in IMAGE_ASSAYS:
            # We need to check that the files we expect actually exist.
            # This is due to the volatility of the datasets.
            if not set(file_paths_expected).issubset(set(file_paths_found)):
                if not self.is_mock:
                    current_app.logger.info(
                        f'Files for assay "{self.assay_type}" '
                        'uuid "{self.uuid}" not found as expected.'
                    )
                return {}
            vc = VitessceConfig(name="HuBMAP Data Portal")
            dataset = vc.add_dataset(name="Visualization Files")
            for file in files:
                dataset = dataset.add_file(**(self._replace_url_in_file(file)))
            vc = view_function(vc, dataset)
            self.conf = vc.to_dict()
            return self.conf
        # elif self.assay_type in TILED_ASSAYS:
        #     found_tiles = _get_matches(file_paths_found, TILE_REGEX)
        #     confs = []
        #     for tile in sorted(found_tiles):
        #         # If there are no cell segmentations, remove the non-imaging parts of the assay.
        #         if f"{CODDEX_SPRM_PATH}/{tile}.cell-sets.json" not in file_paths_found:
        #             new_conf = copy.deepcopy(TILED_SPRM_IMAGING_ONLY)
        #             files_for_layers = [files[0]]
        #         else:
        #             new_conf = copy.deepcopy(conf)
        #             files_for_layers = files
        #         layers = [
        #             self._build_layer_conf(file, tile) for file in files_for_layers
        #         ]
        #         new_conf["layers"] = layers
        #         new_conf["name"] = tile
        #         new_conf = self._replace_view(new_conf)
        #         confs += [new_conf]
        #     self.conf = confs
        #     return confs
        elif self.assay_type in IMAGE_ASSAYS:
            found_images = _get_matches(file_paths_found, files[0]["rel_path"])
            if "seqFish" in self.entity["data_types"]:
                return self._build_seqfish_conf(found_images)
            vc = VitessceConfig(name="HuBMAP Data Portal")
            dataset = vc.add_dataset(name="Visualization Files")
            for img_path in found_images:
                img_url, offsets_url = self._get_img_and_offset_url(
                    img_path, IMAGING_PATHS[IMAGE_PYRAMID]
                )
                dataset = dataset.add_object(
                    OmeTiffWrapper(
                        img_url=img_url, offsets_url=offsets_url, name="Image"
                    )
                )
            vc = view_function(vc, dataset)
            self.conf = vc.to_dict(on_obj=on_obj)
            return self.conf

    def _build_seqfish_conf(self, found_images):
        is_valid_directory = all(
            [re.fullmatch(SEQFISH_REGEX, file) for file in found_images]
        )
        if not is_valid_directory:
            print(f"Directory structure for seqFish dataset {self.uuid} invalid")
            return []
        # Get all files grouped by PosN names.
        images_by_pos = _group_by_file_name(found_images)
        # Get Hybridization per paths grouped by Pos.
        hyb_cycles_per_pos = [
            sorted([_get_hybcycle(image) for image in images])
            for images in images_by_pos
        ]
        confs = []
        # Build up a conf for each Pos.
        for i, images in enumerate(images_by_pos):
            image_wrappers = []
            vc = VitessceConfig(name=f"HuBMAP Data Portal {i}")
            dataset = vc.add_dataset(name="Visualization Files")
            view_config_and_files = ASSAY_CONF_LOOKUP[self.assay_type]
            view_function = view_config_and_files["view_function"]
            for k, img_path in enumerate(sorted(images, key=_get_hybcycle)):
                img_url, offsets_url = self._get_img_and_offset_url(
                    img_path, IMAGING_PATHS[IMAGE_PYRAMID]
                )
                image_wrappers += [OmeTiffWrapper(img_url=img_url, offsets_url=offsets_url, name=f"Image {k}")]
            dataset = dataset.add_object(MultiImageWrapper(image_wrappers))
            vc = view_function(vc, dataset)
            conf = vc.to_dict(on_obj=on_obj)
            del conf['datasets'][0]['files'][0]['options']['renderLayers']
            confs.append(conf)
        self.conf = confs
        return confs

    def _get_img_and_offset_url(self, img_path, replace_params):
        img_url = self._build_assets_url(img_path)
        return (
            img_url,
            str(
                re.sub(
                    r"ome\.tiff?",
                    "offsets.json",
                    img_url.replace(replace_params["image"], replace_params["offsets"]),
                )
            ),
        )

    def _replace_url_in_file(self, file):
        """Build each layer in the layers section.

        returns e.g

        {
          'type': 'CELLS',
          'file_type': 'cells.json',
          'url': 'https://assets.dev.hubmapconsortium.org/uuid/cells.json',
          'name': 'cells'
        }
        """

        return {
            "data_type": file["data_type"],
            "file_type": file["file_type"],
            "url": self._build_assets_url(file["rel_path"]),
        }

    def _build_layer_conf(self, file, tile=""):
        """Build each layer in the layers section.

        returns e.g

        {
          'type': 'CELLS',
          'fileType': 'cells.json',
          'url': 'https://assets.dev.hubmapconsortium.org/uuid/cells.json',
          'name': 'cells'
        }
        """

        return {
            "data_type": file["data_type"],
            "fileType": file["fileType"],
            "url": self._build_assets_url(file["rel_path"].replace(TILE_REGEX, tile))
            if file["data_type"] != "RASTER"
            else self._build_image_layer_datauri(
                [file["rel_path"].replace(TILE_REGEX, tile)]
            ),
            "name": file["data_type"].lower(),
        }

    def _build_multi_file_image_layer_conf(self, files, names=[]):
        """Build each layer in the layers section.

        returns e.g

        {
          'type': 'RASTER',
          'fileType': 'raster.json',
          'url': 'data:base-64-encoded-string'
          'name': 'raster'
        }
        """
        return {
            "data_type": "RASTER",
            "fileType": "raster.json",
            "url": self._build_image_layer_datauri(files, names),
            "name": "raster",
        }

    def _build_image_layer_datauri(self, rel_paths, names=[]):
        """
        Specifically for the RASTERS schema, we need to build a DataURI of the schema because
        it contains a URL for a file whose location is unknown until pipelines have been run.

        returns e.g:

        DataURI.make(
          'text/plain',
          charset='us-ascii',
          base64=True,
           data=json.dumps(
             {
               'schema_version': '0.0.1'
               'images': [
                 {
                   'name': 'example.ome.tiff'
                   'type': 'ome-tiff'
                   'url': 'https://assets.dev.hubmapconsortium.org/uuid/example.ome.tiff',
                 }
               ]
             }
            )
        )

        """

        image_layer = {}
        image_layer["images"] = [
            self._build_image_schema(rel_path, names[i] if names else None)
            for i, rel_path in enumerate(rel_paths)
        ]
        image_layer["schemaVersion"] = "0.0.2"
        return DataURI.make(
            "text/plain", charset="us-ascii", base64=True, data=json.dumps(image_layer)
        )

    def _build_image_schema(self, image_rel_path, name=None):
        """
        Builds the 'images' sections of the RASTER schema.

        returns e.g

        {
          'name': 'example.ome.tiff'
          'type': 'ome-tiff'
          'url': 'https://assets.dev.hubmapconsortium.org/uuid/example.ome.tiff',
        }

        """

        schema = {}
        schema["name"] = name if name is not None else Path(image_rel_path).name
        schema["data_type"] = "ome-tiff"
        schema["url"] = self._build_assets_url(image_rel_path)
        schema["metadata"] = {}
        imaging_paths = IMAGING_PATHS[self.assay_type]
        offsets_path = re.sub(
            r"ome\.tiff?$",
            "offsets.json",
            image_rel_path.replace(imaging_paths["image"], imaging_paths["offsets"]),
        )
        schema["metadata"]["omeTiffOffsetsUrl"] = self._build_assets_url(
            str(offsets_path)
        )
        return schema

    def _build_assets_url(self, rel_path):
        """
      Create a url for an asset.

      returns e.g

      'https://assets.dev.hubmapconsortium.org/uuid/rel_path/to/clusters.ome.tiff',

      """
        if not self.is_mock:
            assets_endpoint = current_app.config["ASSETS_ENDPOINT"]
        else:
            assets_endpoint = MOCK_URL
        base_url = urllib.parse.urljoin(assets_endpoint, f"{self.uuid}/{rel_path}")
        token_param = urllib.parse.urlencode({"token": self.nexus_token})
        return base_url + "?" + token_param

    def _replace_view(self, conf):
        """
      Replace the 'view' section of IMAGE_ASSAYS with a reasonable initial view.
      """

        if self.assay_type not in IMAGE_ASSAYS:
            return conf
        conf["staticLayout"][-1]["props"]["view"] = copy.deepcopy(
            ASSAY_CONF_LOOKUP[self.assay_type]["view"]
        )

        # IMS needs to be zoomed in a bit more,
        # but we don't have a great of finding this assay type:
        # The images are generally smaller but have a lot of padding.

        # IMS images are named under this convention, "IMS_XXXMode".
        # Some of the non IMS images contain the substring "IMS," so that is insufficient.
        # IMC also needs to be handled specially, as does seqFish.
        # TODO: Clean this up by handling multiple assay types (#982).
        if "seqFish" in self.entity["data_types"] or any(
            "IMS_PosMode" in file["rel_path"]
            or "IMS_NegMode" in file["rel_path"]
            or "IMC" in self.entity["data_types"]
            for file in self.entity["files"]
        ):
            conf["staticLayout"][-1]["props"]["view"]["zoom"] = -2
            conf["staticLayout"][-1]["props"]["view"]["target"] = [1000, 1000, 0]
        return conf
