import { DataTypes, Model } from "sequelize";
import { sequelize, } from "../utils/sequelize";

export class User extends Model {
    declare id: number;
    declare user_name: string;
    declare created_at: string;
    declare updated_at: string;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    user_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    tableName: 'user',
    timestamps: false
    // Other model options go here
});