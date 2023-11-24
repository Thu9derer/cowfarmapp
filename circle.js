// объявяление тега и контекста
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// опорные константы
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = canvas.width / 2;
const sectorAngle = Math.PI / 2;

// круг по центру
const centerCircle = document.querySelector('.center-circle');

// данные всей системы
let simpleCircle;

// конструктор для данных круга
function SimpleCircle(spinCounter, sectors, animals) {
    this.spinCounter = spinCounter;
    this.sectors = sectors;
    this.animals = animals;
}

// конструктор для данных животного
function AnimalData(id, name, image_url, sector_id, damage, xp) {
    this.id = id;
    this.name = name;
    this.image_url = image_url;
    this.sector_id = sector_id;
    this.damage = damage;
    this.xp = xp;
}

// конструктор для данных сектора
function SectorData(id, X, Y, color) {
    this.id = id;
    this.X = X;
    this.Y = Y;
    this.color = color;
}

// Генерация случайного целого числа от min до max
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Проверка что число секторов равно числу животных
function checkInitData() {
    let ans = simpleCircle.sectors.length === simpleCircle.animals.length;
    if (!ans)
        console.log("Error: Bad JSON init data. Different len of init arrays!");
    return ans;
}

// Читаем JSON и заполняем объекты
function readJSON() {
// Создаем новый объект XMLHttpRequest
    const xhr = new XMLHttpRequest();

// Открываем файл "data.json"
    xhr.open('GET', 'data.json');

// Устанавливаем заголовок Content-Type
    xhr.setRequestHeader('Content-Type', 'application/json');

// Обработчик загрузки файла
    xhr.onload = function() {
        // Если статус запроса успешный (код 200)
        if (xhr.status === 200) {
            let sectors = [];
            let animals = [];
            // Парсим содержимое файла JSON в объект
            const json = JSON.parse(xhr.responseText);

            for (const obj of json["sectors"])
                sectors.push(new SectorData(obj.id, obj.X, obj.Y, obj.color));

            for (const obj of json["animals"])
                animals.push(new AnimalData(obj.id, obj.name, obj.image_url, obj.sector_id, getRandomInt(1, 10), getRandomInt(1, 10)));

            simpleCircle = new SimpleCircle(json["spins_count"], sectors, animals);

            console.log(simpleCircle);
        }
    };

// Отправляем запрос на сервер
    xhr.send();
}

// Пишем JSON
function writeJSON() {
    console.log("JSON str:\n" + JSON.stringify(simpleCircle, null, 4));
}

// Сопоставление пары x-y и пары startAngle-endAngle
function translateCoordinates(x, y) {
    if(x === 1 && y === 1) return { startAngle: 0, endAngle: sectorAngle };
    if(x === 0 && y === 1) return { startAngle: sectorAngle, endAngle: 2 * sectorAngle };
    if(x === 0 && y === 0) return { startAngle: 2 * sectorAngle, endAngle: 3 * sectorAngle };
    if(x === 1 && y === 0) return { startAngle: 3 * sectorAngle, endAngle: 4 * sectorAngle };
}

// Закрасить круг
function fillCircleWhite() {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius  + 1, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'white';
    ctx.fill();
}

// Отрисовка сектора, его картинки и текста внутри
function drawSector(X, Y, color, text, imgLink) {
    let sectorAngles = translateCoordinates(X, Y);
    let startAngle = sectorAngles["startAngle"];
    let endAngle = sectorAngles["endAngle"];
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#000';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textX = centerX + (radius / 2) * Math.cos((startAngle + endAngle) /  2);
    const textY = centerY + (radius / 2) * Math.sin((startAngle + endAngle) / 2) - 30;
    const imgX = centerX + (radius / 2) * Math.cos(startAngle + sectorAngle / 2) - 50 / 2;
    const imgY =  centerY + (radius / 2) * Math.sin(startAngle + sectorAngle / 2) - 50 / 2 + 10;
    ctx.fillText(text, textX, textY);
    const img = new Image();
    img.src = imgLink;
    img.onload = function() {
        ctx.drawImage(img, 0, 0, img.width, img.height, imgX, imgY, 50, 50);
    }
}

// Меняет координаты для поворота по часовой стрелке
function turnClockwise() {
    simpleCircle.animals.unshift(simpleCircle.animals.pop());
    for (const animal of simpleCircle.animals)
        animal.sector_id = (animal.sector_id + 1) % simpleCircle.animals.length
}

// Отрисовывает все сектора
function drawSectors() {
    for(let i = 0; i < simpleCircle.sectors.length; ++i)
        drawSector(simpleCircle.sectors[i].X,
                   simpleCircle.sectors[i].Y,
                   simpleCircle.sectors[i].color,
              `${simpleCircle.animals[i].name}: ${simpleCircle.animals[i].damage}/${simpleCircle.animals[i].xp}`,
                   simpleCircle.animals[i].image_url);
}

function updateState(){
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'api/state');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            let sectors = [];
            let animals = [];
            const json = JSON.parse(xhr.responseText);
            for (const obj of json["sectors"])
                sectors.push(new SectorData(obj.id, obj.X, obj.Y, obj.color));
            for (const obj of json["animals"])
                animals.push(new AnimalData(obj.id, obj.name, obj.image_url, obj.sector_id, getRandomInt(1, 10), getRandomInt(1, 10)));
            simpleCircle = new SimpleCircle(json["spins_count"], sectors, animals);
            console.log(simpleCircle);
        }
    };
}

function saveState(){
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "api/save");
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8")
        const body = JSON.stringify(simpleCircle);
        xhr.onload = () => {
                if (xhr.readyState == 4 && xhr.status == 201) {
                        console.log(JSON.parse(xhr.responseText));
                } else {
                        console.log(`Error: ${xhr.status}`);
                }
        };
        xhr.send(body);
}
function changeSectorsOrder() {
    fillCircleWhite();
    turnClockwise()
    drawSectors();
    ++simpleCircle.spinCounter;
    saveState();
    updateState();
    writeJSON();
}

// MAIN

fillCircleWhite();
readJSON();
// даем время на чтение JSON
setTimeout(() => {
    if (checkInitData()){
        centerCircle.addEventListener('click', changeSectorsOrder);
        drawSectors();
    }
}, 100);
