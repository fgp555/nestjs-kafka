// kafka.controller.ts
import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { Kafka } from 'kafkajs';

@Controller('kafka')
export class KafkaController {
  private kafkaAdmin;
  private kafkaConsumer;

  constructor(
    private readonly kafkaService: KafkaService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: KafkaService,
  ) {
    // Crear una instancia de Kafka para acceder al administrador
    const kafka = new Kafka({
      clientId: 'my-app',
      brokers: ['localhost:9092'],
    });

    this.kafkaAdmin = kafka.admin();
    this.kafkaConsumer = kafka.consumer({ groupId: 'my-consumer-group' });

  }

  @Post('produce')
  async produceMessage(@Body() message: { content: string }) {
    const result = await this.kafkaService.sendMessage('my-topic', {
      value: message.content,
    });
    return { message: 'Mensaje enviado a Kafka', result };
  }

  @Get('status')
  checkStatus() {
    return { message: 'Kafka service is operational' };
  }

  @Get('topics')
  async listTopics() {
    await this.kafkaAdmin.connect();
    const topics = await this.kafkaAdmin.listTopics();
    await this.kafkaAdmin.disconnect();
    return { topics };
  }

  @Get('partitions/:topic')
  async listPartitions(@Param('topic') topic: string) {
    await this.kafkaAdmin.connect();
    const metadata = await this.kafkaAdmin.fetchTopicMetadata({
      topics: [topic],
    });
    await this.kafkaAdmin.disconnect();

    const partitions = metadata.topics[0]?.partitions.length || 0;
    return { topic, partitions };
  }

  @Get('consumers')
  async listConsumers() {
    await this.kafkaAdmin.connect();
    const consumerGroups = await this.kafkaAdmin.listGroups();
    await this.kafkaAdmin.disconnect();
    return { consumerGroups };
  }

  @Get('consumer-lag/:groupId')
  async checkConsumerLag(@Param('groupId') groupId: string) {
    await this.kafkaAdmin.connect();
    const groupDescription = await this.kafkaAdmin.describeGroups([groupId]);
    await this.kafkaAdmin.disconnect();

    const lagInfo = groupDescription.groups[0]?.members.map((member) => ({
      memberId: member.memberId,
      clientId: member.clientId,
      lag: member.memberMetadata.lag,
    }));

    return { groupId, lagInfo };
  }

  // Endpoint para listar los offsets de un tema específico
  @Get('offsets/:topic')
  async listOffsets(@Param('topic') topic: string) {
    await this.kafkaAdmin.connect();
    const partitions = await this.kafkaAdmin.fetchTopicOffsets(topic);

    const offsets = partitions.map((partition) => ({
      partition: partition.partition,
      beginningOffset: partition.offset,
      endOffset: partition.offset,
    }));

    await this.kafkaAdmin.disconnect();
    return { topic, offsets };
  }

  // Endpoint para listar los mensajes de un tema específico
  @Get('messages/:topic')
  async listMessages(@Param('topic') topic: string) {
    await this.kafkaConsumer.connect();
    await this.kafkaConsumer.subscribe({ topic, fromBeginning: true });

    const messages = [];

    await this.kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        messages.push({
          offset: message.offset,
          key: message.key ? message.key.toString() : 'empty',
          timestamp: new Date(parseInt(message.timestamp)).toISOString(),
          headers: message.headers ? Object.keys(message.headers) : 'empty',
          value: message.value ? message.value.toString() : 'empty',
        });
      },
    });

    // Esperar brevemente para permitir que el consumidor lea mensajes y luego desconectarse
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await this.kafkaConsumer.disconnect();

    return { topic, messages };
  }
}
