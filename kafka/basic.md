```bash

# ========== docker-compose ==========
# Inicia los servicios de Kafka y Zookeeper con Docker:
docker-compose up -d

# verificar
docker ps

docker-compose down
docker-compose up -d



# ========== kafka container ==========
# Conéctate al contenedor de Kafka
docker exec -it docker-kafka-1 /bin/bash


# Verifica los logs del contenedor de Kafka
docker logs docker-kafka-1



# ========== kafka topics prueba ==========

# Verifica la conexión a Kafka dentro del contenedor
kafka-topics --bootstrap-server localhost:9092 --list

# Crear un tema de prueba:
kafka-topics --bootstrap-server localhost:9092 --create --topic test-topic --partitions 1 --replication-factor 1


# ========== debug ==========

# Ejecuta el siguiente comando en PowerShell para crear un contenedor temporal con kafkacat y verificar la conexión:
docker run --rm --network="host" edenhill/kafkacat:1.6.0 -b localhost:9092 -L


# Primero, encuentra la IP del contenedor de Kafka ejecutando:
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' docker-kafka-1

# Usa la IP obtenida en lugar de localhost en el comando kafkacat:
docker run --rm edenhill/kafkacat:1.6.0 -b 172.18.0.3:9092 -L

# Encuentra el nombre de la red en la que está ejecutándose el contenedor de Kafka:
docker network ls

# Ejecuta kafkacat en la misma red de Docker:
docker run --rm --network docker_default edenhill/kafkacat:1.6.0 -b 172.18.0.3:9092 -L


```
