import { Question } from '../domain/question';

export interface IQuestionRepository {
  findByUuid(body: Pick<Question, 'uuid'>): Promise<Question>;
  findByUserUuid(body: Pick<Question, 'userUuid'>): Promise<Question>;
  deleteOneByUserUuid(body: Pick<Question, 'userUuid'>): Promise<boolean>;
  updateQuestion(body: Partial<Question>): Promise<boolean>;
}
