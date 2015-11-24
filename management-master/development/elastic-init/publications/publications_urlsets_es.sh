#!/bin/bash
# Create Index
# curl -XPUT 'http://localhost:9200/index/'
# Delete Index
# curl -XDELETE 'http://localhost:9200/index/'
# List Indexes
# curl 'http://localhost:9200/_cat/indices?v'

curl -XPOST 'http://localhost:9200/publications_urlsets/_cache/clear'
curl -XDELETE 'http://localhost:9200/publications_urlsets/'
curl -XPUT 'http://localhost:9200/publications_urlsets/'
curl -XPUT 'http://localhost:9200/publications_urlsets/_mapping/urlset' -d '
{
    "urlset": {
        "properties" : {
            "data_id": {"type" : "string"},
            "data_body": {"type" : "binary"},
            "published_at": {"type" : "string"},
            "mysql_id": {"type" : "string"}
        }
    }
}
'