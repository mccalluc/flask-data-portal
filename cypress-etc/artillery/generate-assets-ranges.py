#!/usr/bin/env python

from sys import exit
import random

import requests

es_docs = 20
es_url = 'https://search-api.stage.hubmapconsortium.org/portal/search'
assets_url = 'https://assets.stage.hubmapconsortium.org'
rows_per_file = 10
chunk_size = 2**16

response = requests.post(
    es_url,
    json={
        "post_filter": {
            "exists": {"field": "files"}
        },
        "size": es_docs,
        "_source": ["uuid", "files"],
        "sort": {"uuid.keyword": "asc"}
    },
    headers={
        'Content-Type': 'application/json'
    }).json()

file_sizes = {}

for hit in response['hits']['hits']:
    uuid = hit['_source']['uuid']
    for file_info in hit['_source']['files']:
        if file_info['rel_path'].endswith('.ome.tiff'):
            full_url = f'{assets_url}/{uuid}/{file_info["rel_path"]}'
            file_sizes[full_url] = file_info['size']

if not len(file_sizes.keys()):
    print(response)
    print('This response was unexpected.')
    exit(1)

for (url, size) in file_sizes.items():
    chunk_count = size % chunk_size
    if chunk_count < rows_per_file:
        continue
    # chunks = random.sample(range(chunk_count), rows_per_file)
    chunks = range(10)
    for i in chunks:
        bottom = i * chunk_size
        top = (i + 1) * chunk_size - 1
        print(f'{bottom}-{top},{url}')
