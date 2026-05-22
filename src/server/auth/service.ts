import { hashPassword, verifyPassword } from "@/lib/crypto/password";
import { createTokens, getRefreshTokenCookie, getClearRefreshTokenCookie } from "./tokens";
import type { UserRepository } from "@/server/repositories/userRepository";
import type { JwtResult } from "@/lib/crypto/jwt";

export type AuthError = {
  code: string;
  message: string;
  status: number;
};

export type AuthSuccess<T> = {
  data: T;
  setCookie?: string;
};

export type RegisterInput = {
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResponse = {
  success: boolean;
  data: {
    userId: string;
    email: string;
    accessToken: string;
    refreshToken: string;
  };
};

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private pepper: string,
    private env: Record<string, unknown>,
  ) {}

  async register(input: RegisterInput): Promise<JwtResult<AuthSuccess<AuthResponse>>> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      return { data: null, error: "EMAIL_EXISTS" };
    }

    const { passwordHash, passwordSalt } = await hashPassword(input.password, this.pepper);

    const userId = crypto.randomUUID();
    const user = await this.userRepo.create({
      id: userId,
      email: input.email,
      passwordHash,
      passwordSalt,
    });

    if (!user) {
      return { data: null, error: "CREATE_FAILED" };
    }

    const tokens = await createTokens(user.id, user.email, this.env);
    if (tokens.error) return tokens;

    await this.userRepo.updateRefreshToken(user.id, tokens.data!.refreshToken);

    return {
      data: {
        data: {
          success: true,
          data: {
            userId: user.id,
            email: user.email,
            accessToken: tokens.data!.accessToken,
            refreshToken: tokens.data!.refreshToken,
          },
        },
        setCookie: getRefreshTokenCookie(tokens.data!.refreshToken, this.env),
      },
      error: null,
    };
  }

  async login(input: LoginInput): Promise<JwtResult<AuthSuccess<AuthResponse>>> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user || !user.passwordHash || !user.passwordSalt) {
      return { data: null, error: "INVALID_CREDENTIALS" };
    }

    const valid = await verifyPassword(input.password, this.pepper, user.passwordHash, user.passwordSalt);
    if (!valid) {
      return { data: null, error: "INVALID_CREDENTIALS" };
    }

    const tokens = await createTokens(user.id, user.email, this.env);
    if (tokens.error) return tokens;

    await this.userRepo.updateRefreshToken(user.id, tokens.data!.refreshToken);

    return {
      data: {
        data: {
          success: true,
          data: {
            userId: user.id,
            email: user.email,
            accessToken: tokens.data!.accessToken,
            refreshToken: tokens.data!.refreshToken,
          },
        },
        setCookie: getRefreshTokenCookie(tokens.data!.refreshToken, this.env),
      },
      error: null,
    };
  }

  async logout(): Promise<{ setCookie: string }> {
    return { setCookie: getClearRefreshTokenCookie(this.env) };
  }

  async refresh(
    refreshToken: string,
    tokenRevocation?: KVNamespace,
  ): Promise<JwtResult<AuthSuccess<AuthResponse>>> {
    if (tokenRevocation && await tokenRevocation.get(refreshToken)) {
      return { data: null, error: "TOKEN_REVOKED" };
    }

    const user = await this.userRepo.findByRefreshToken(refreshToken);
    if (!user) {
      return { data: null, error: "INVALID_REFRESH_TOKEN" };
    }

    const tokens = await createTokens(user.id, user.email, this.env);
    if (tokens.error) return tokens;

    await this.userRepo.updateRefreshToken(user.id, tokens.data!.refreshToken);

    return {
      data: {
        data: {
          success: true,
          data: {
            userId: user.id,
            email: user.email,
            accessToken: tokens.data!.accessToken,
            refreshToken: tokens.data!.refreshToken,
          },
        },
        setCookie: getRefreshTokenCookie(tokens.data!.refreshToken, this.env),
      },
      error: null,
    };
  }

  async revokeToken(refreshToken: string, tokenRevocation: KVNamespace): Promise<void> {
    await tokenRevocation.put(refreshToken, "revoked", { expirationTtl: 604800 });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<JwtResult<{ success: boolean }>> {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.passwordHash || !user.passwordSalt) {
      return { data: null, error: "USER_NOT_FOUND" };
    }

    const valid = await verifyPassword(currentPassword, this.pepper, user.passwordHash, user.passwordSalt);
    if (!valid) {
      return { data: null, error: "INVALID_CURRENT_PASSWORD" };
    }

    const { passwordHash, passwordSalt } = await hashPassword(newPassword, this.pepper);
    await this.userRepo.updatePassword(userId, passwordHash, passwordSalt);

    return { data: { success: true }, error: null };
  }

  async updatePreferences(
    userId: string,
    preferences: { personality?: string; theme?: "light" | "dark" },
  ): Promise<JwtResult<{ success: boolean }>> {
    await this.userRepo.updatePreferences(userId, preferences);
    return { data: { success: true }, error: null };
  }
}
