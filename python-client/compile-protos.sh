uv run -m grpc_tools.protoc -I ../schema/ --python_betterproto_out=src/metagame server-message.proto client-message.proto
