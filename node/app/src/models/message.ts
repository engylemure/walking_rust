import { DataTypes, Model } from "sequelize";
import { sequelize, } from "../utils/sequelize";
import { Channel } from "./channel";
import { User } from ".";

export class Message extends Model {
    declare id: number;
    declare content: string;
    declare user_id: number;
    declare channel_id: number;
    declare answer_to_id?: number;
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
    answer_to_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
Message.hasOne(User, {
    foreignKey: {
        name: 'id',
        field: 'user_id'
    },
    as: 'user',
});
Message.hasOne(Message, {
    foreignKey: {
        name: 'id',
        field: 'answer_to_id'
    },
    as: 'answerTo'
});
Channel.hasMany(Message, {
    foreignKey: {
        name: 'channel_id',
        field: 'id'
    },
    as: 'messages'
});