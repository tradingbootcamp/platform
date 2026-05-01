protoc -I ../schema/ --python_betterproto_out=src/metagame --experimental_allow_proto3_optional server-message.proto client-message.proto
