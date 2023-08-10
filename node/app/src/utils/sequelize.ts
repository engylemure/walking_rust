import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(process.env.DATABASE_URL!);

export function initializeSequelize({ onResolve, onRejected }: { onResolve?: () => void; onRejected?: (err: any) => void;  } = {}) {
    sequelize.authenticate().then(onResolve).catch(onRejected)
    return sequelize
}