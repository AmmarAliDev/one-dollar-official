import { PrismaClient, RoleKey } from "@prisma/client";
import bcrypt from "bcryptjs";

import { e2eAdmin } from "./helpers/test-data";

const prisma = new PrismaClient();

const roleSeeds = [
  {
    key: RoleKey.SUPER_ADMIN,
    name: "Super admin",
    permissions: [
      "admin:access",
      "catalog:read",
      "catalog:write",
      "orders:read",
      "orders:write",
      "users:read",
      "settings:manage",
    ],
  },
  {
    key: RoleKey.PRODUCT_MANAGER,
    name: "Product manager",
    permissions: ["admin:access", "catalog:read", "catalog:write", "orders:read"],
  },
  {
    key: RoleKey.ORDER_MANAGER,
    name: "Order manager",
    permissions: ["admin:access", "orders:read", "orders:write", "users:read"],
  },
  {
    key: RoleKey.CUSTOMER,
    name: "Customer",
    permissions: [],
  },
  {
    key: RoleKey.GUEST,
    name: "Guest",
    permissions: [],
  },
] as const;

async function seedRoles() {
  for (const role of roleSeeds) {
    await prisma.role.upsert({
      where: { key: role.key },
      update: {
        name: role.name,
        permissions: role.permissions,
      },
      create: {
        key: role.key,
        name: role.name,
        permissions: role.permissions,
      },
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { key: RoleKey.SUPER_ADMIN },
  });
  const passwordHash = await bcrypt.hash(e2eAdmin.password, 10);

  await prisma.user.upsert({
    where: { email: e2eAdmin.email },
    update: {
      name: e2eAdmin.name,
      password: passwordHash,
      roleId: adminRole.id,
    },
    create: {
      email: e2eAdmin.email,
      name: e2eAdmin.name,
      password: passwordHash,
      roleId: adminRole.id,
    },
  });
}

export default async function globalSetup() {
  try {
    await seedRoles();
  } finally {
    await prisma.$disconnect();
  }
}
