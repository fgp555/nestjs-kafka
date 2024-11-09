// kafka/kafka.service.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaService implements OnModuleInit {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {}

  async onModuleInit() {
    // Suscribirse a un tema específico
    this.kafkaClient.subscribeToResponseOf('my-topic');
    await this.kafkaClient.connect();
  }

  // Método para enviar mensajes al tema de Kafka
  sendMessage(topic: string, message: any) {
    return this.kafkaClient.emit(topic, message);
  }
}
