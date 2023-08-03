dockerize -wait tcp://$DB_HOST:$DB_PORT

cd app

echo "Environment: $PYTHON_ENV"

if [[ $PYTHON_ENV == *"dev"* ]]; then
  uvicorn src.main:app --loop uvloop --host "0.0.0.0" --port $SERVER_PORT --reload
else
  uvicorn src.main:app --loop uvloop --host "0.0.0.0" --port $SERVER_PORT
fi