// kafka/kafka.consumer.ts
import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class KafkaConsumer {
  @EventPattern('my-topic')
  async handleMessage(@Payload() message) {
    console.log('Mensaje recibido de Kafka:', message.value);
  }
}
