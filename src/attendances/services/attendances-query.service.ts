import { Injectable } from '@nestjs/common';
import { IAttendancesQueryService } from '../interfaces/attendances.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { AttendanceEntity } from 'src/entities/attendances.entity';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

const SERVER_ERROR = 'Something went wrong!';
const NOT_FOUND_MESSAGE = 'Attendance not found!';

@Injectable()
export class AttendancesQueryService implements IAttendancesQueryService {
  constructor(
    @InjectRepository(AttendanceEntity)
    private readonly attendanceRepository: Repository<AttendanceEntity>,
  ) {}

  async getAttendances(): Promise<AttendanceEntity[]> {
    try {
      return await this.attendanceRepository.find();
    } catch (error) {
      if (error) throw new InternalServerErrorException(SERVER_ERROR);
    }
  }

  async getSingleAttendance(id: string): Promise<AttendanceEntity> {
    try {
      const student = await this.attendanceRepository.findOneBy({ id: id });
      return student;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Check if the QueryFailedError is thrown and is caused by invalid uuid
      if (
        error instanceof QueryFailedError &&
        error.message.includes('invalid input syntax for type uuid')
      ) {
        throw new NotFoundException(NOT_FOUND_MESSAGE);
      }
    }
  }
}
