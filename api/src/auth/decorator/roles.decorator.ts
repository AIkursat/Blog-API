import { SetMetadata } from "@nestjs/common/decorators";

export const hasRoles = (...hasRoles: string[]) => SetMetadata('roles', hasRoles)