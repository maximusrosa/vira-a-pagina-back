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
        // Verificação de e-mail. 
        const user = await this.userService.findByEmail(email)
        if (user == null) return null;
        

        // Verificação da senha (com criptografia)
        if (this.encryptionService.comparePassword(user.password, password)){
            // Remove campo sensível de senha antes de retornar um objeto usuário.
            const { password, ...result } = user;  // decidir se o campo confirmPassword é necessário
            return result;
        }
        else
            return null;
        
    }

    // Gera token JWT depois de validar usuário.
    async login(user: any) {
        // Dados de usuário que serão usados para criar o token.
        const payload = {
            email: user.email,
            sub: user._id,
        };
        
        // Cria token.
        return {
            id: user.id,
            role: user.role,
            token: this.jwtService.sign(payload),
        };
    }

    async signup(signupDto: CreateUserDto): Promise<any> {  
        if (signupDto.password !== signupDto.confirmPassword)
            throw new HttpException('Há diferença entre as senhas.', HttpStatus.BAD_REQUEST);
        
        const existingUser = await this.userService.findByEmail(signupDto.email);
        if (existingUser) {
            throw new HttpException('Este e-mail já foi cadastrado', HttpStatus.CONFLICT);
        }

        const hashedPassword = await this.encryptionService.encryptPassword(
          signupDto.password,
        );
    
        await this.userService.create({
          name: signupDto.name,
          email: signupDto.email,
          password: hashedPassword,
          role: signupDto.role,
        });
    }
}
