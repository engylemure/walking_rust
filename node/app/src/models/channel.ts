import { DataTypes, Model } from "sequelize";
import { sequelize, } from "../utils/sequelize";
import { Message } from "./message";

export class Channel extends Model {
    declare id: number;
    declare name: string;
    declare created_at: string;
    declare updated_at: string;
}


Channel.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
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
    tableName: 'channel',
    timestamps: false
    // Other model options go here
});