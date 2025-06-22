import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/domain/user/dtos/create-user.dto';
import { UserService } from 'src/domain/user/user.service';
import { ModeratorService } from 'src/domain/moderator/moderator.service';
import { UserStatus } from '@prisma/client';
import { EncryptionService } from '../encryption/encryption.service';
import { JwtService} from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common'; 

@Injectable()
export class AuthService {

    constructor(
        private userService: UserService,
        private moderatorService: ModeratorService,
        private encryptionService: EncryptionService,
        private jwtService: JwtService,
    ) {}

    async validateLogin(email: string, password: string, isMod: boolean = false): Promise<any> {
        if (isMod){
            const moderator = await this.moderatorService.findByEmail(email);
            if (moderator == null) return null;

            if (this.encryptionService.comparePassword(moderator.password, password)){
                const { password, ...result } = moderator;
                return result;
            }
            else
                return null;
        }
        else {
            const user = await this.userService.findByEmail(email, true);
            if (user == null) return null;

            if (this.encryptionService.comparePassword(user.password, password)){
                const { password, ...result } = user;
                return result;
            }
            else
                return null;
        }
    }

    async login(user: any) {
        const payload = {
            email: user.email,
            sub: user.id,
        };

        console.log('Payload:', payload);
        
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            token: this.jwtService.sign(payload),
        };
    }

    async signup(signupDto: CreateUserDto): Promise<any> {  
        // Verify if email is from UFRGS
        const validEmail = signupDto.email.match(/^[\w-\.]+@ufrgs\.br$/);
        if (!validEmail) {
            throw new HttpException('Deve usar email válido da UFRGS (@ufrgs.br)', HttpStatus.BAD_REQUEST);
        }

        if (signupDto.password !== signupDto.confirmPassword)
            throw new HttpException('Há diferença entre as senhas.', HttpStatus.BAD_REQUEST);
        
        const existingUser = await this.userService.findByEmail(signupDto.email, false);
        if (existingUser) {
            if (existingUser.status == 'WAITING_APROVAL') {
                throw new HttpException('Esta conta está aguardando aprovação', HttpStatus.CONFLICT);
            } else {
                throw new HttpException('Este e-mail já foi cadastrado', HttpStatus.CONFLICT);
            }
        }

        const existingUniCard = await this.userService.findByUniCard(signupDto.uniCard, false);
        if (existingUniCard) {
            throw new HttpException('Este cartão universitário já foi cadastrado', HttpStatus.CONFLICT);
        }

        const hashedPassword = await this.encryptionService.encryptPassword(signupDto.password);
    
        await this.userService.create({
          name: signupDto.name,
          email: signupDto.email,
          password: hashedPassword,
          uniCard: signupDto.uniCard,
          course: signupDto.course,
          contact: signupDto.contact,
          rating: 5.0, // Default rating from schema
          status: UserStatus.WAITING_APPROVAL
        });
    }
}