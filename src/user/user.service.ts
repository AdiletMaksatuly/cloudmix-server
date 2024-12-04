import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Repository } from "typeorm";
import { User } from "./user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(username: string, email: string, password: string): Promise<Omit<User, 'password'>> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({ username, email, password: hashedPassword });

    const { password: _, ...savedUser } = await this.userRepository.save(newUser);

    return savedUser;
  }

  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ email }],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ id }]
    });
  }

  async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getAllUsers(name?: string): Promise<Omit<User, 'password'>[]> {
    const whereCondition = name
      ? { username: Like(`%${name}%`) }
      : {};

    const users = await this.userRepository.find({ where: whereCondition });

    return users.map(({ password, ...user }) => user);
  }
}
