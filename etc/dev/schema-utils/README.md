We currently have no schema that describes the Entity documents the Portal relies on.
We have requested a schema from PSC, and they have been unable to provide one.
This directory contains scripts for pulling down documents,
generating schemas from those documents,
and validating documents against generated schemas.

If anything comes of this,
it might be incorporated in the validation hook we already have in
[`search-api`](https://github.com/hubmapconsortium/search-api/pull/564):
The idea is that a validation error wouldn't cause indexing to fail,
but it would alert us to unexpected changes in document structure.

```
pip install genson    # Didn't want to clutter the main requirements.txt with this.
get_entities.py       # Download all entities and fill up a gitignored cache dir.
build_schemas.py      # Scan entities and build schemas (which have been checked in).
validate_entities.py  # Validate downloaded entities against generated schemas.
```