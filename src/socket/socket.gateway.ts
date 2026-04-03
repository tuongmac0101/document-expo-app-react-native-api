import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

/**
 * SocketGateway - Pure Socket.io Implementation
 * Manages WebSocket connections and real-time events.
 */
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(SocketGateway.name);

  afterInit(server: Server) {
    this.logger.log('SocketGateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emit a 'new_question' event to all connected clients.
   * Called from QuestionsService after successful database save.
   */
  emitNewQuestion(question: any) {
    this.server.emit('new_question', question);
    this.logger.log(`Broadcasting new question: ${question.id}`);
  }

  /**
   * Emit a 'new_answer' event to all connected clients.
   * Includes the answer details and questionId for frontend filtering.
   * Called from AnswersService after successful database save.
   */
  emitNewAnswer(answer: any) {
    // We ensure the payload has sufficient data for the frontend
    const payload = {
      ...answer,
      questionId: answer.question?.id || answer.questionId,
    };
    this.server.emit('new_answer', payload);
    this.logger.log(`Broadcasting new answer for question ${payload.questionId}`);
  }
}
