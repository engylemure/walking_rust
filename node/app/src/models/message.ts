import { DataTypes, Model } from "sequelize";
import { sequelize, } from "../utils/sequelize";
import { Channel } from "./channel";
import { User } from ".";

export class Message extends Model {
    declare id: number;
    declare content: string;
    declare user_id: number;
    declare channel_id: number;
    declare created_at: string;
    declare updated_at: string;
}

Message.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    channel_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    tableName: 'message',
    timestamps: false,
})

Message.hasOne(Channel, {
    foreignKey: {
        name: 'id',
        field: 'channel_id'
    },
    as: 'channel'
});
Message.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});
Channel.hasMany(Message, {
    foreignKey: {
        name: 'channel_id',
        field: 'id'
    },
    as: 'messages'
});