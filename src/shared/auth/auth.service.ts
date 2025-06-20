import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/domain/user/dtos/create-user.dto';
import { UserService } from 'src/domain/user/user.service';
import { EncryptionService } from '../encryption/encryption.service';
import { JwtService} from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common'; 

@Injectable()
export class AuthService {

    constructor(
        private userService: UserService,
        private encryptionService: EncryptionService,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findByEmail(email)
        if (user == null) return null;
        
        if (this.encryptionService.comparePassword(user.password, password)){
            const { password, ...result } = user;
            return result;
        }
        else
            return null;
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
            uniCard: user.uniCard,
            course: user.course,
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
        
        const existingUser = await this.userService.findByEmail(signupDto.email);
        if (existingUser) {
            throw new HttpException('Este e-mail já foi cadastrado', HttpStatus.CONFLICT);
        }

        const existingUniCard = await this.userService.findByUniCard(signupDto.uniCard);
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
        });
    }
}