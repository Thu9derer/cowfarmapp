import asyncio
import logging
from aiogram import Bot, Dispatcher, types, executor
from aiogram.types.web_app_info import WebAppInfo
from config_reader import config

logging.basicConfig(level=logging.INFO)


bot = Bot(token=config.bot_token.get_secret_value())
dp = Dispatcher(bot)


@dp.message_handler(commands=['start'])
async def cmd_start(message: types.Message):
    marcup = types.ReplyKeyboardMarkup()
    marcup.add(types.KeyboardButton('Open web APP', web_app=WebAppInfo(url='https://thu9derer.github.io/tele_app/')))
    await message.answer("Привет!", reply_markup=marcup)


@dp.message_handler(commands=['help'])
async def cmd_help(message: types.Message):
    await message.answer("Это помощь.")


if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
