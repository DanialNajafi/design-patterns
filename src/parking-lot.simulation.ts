import { ParkingLot } from "./parking-lot.js";
import { Display }    from "./display.js";

const maxFillIntervalMillis      = 1000;
const maxEmptyIntervalMillis     = 2000;
const initialFillPhaseMillis     = 5000;

// Hilfsfunktionen
const sleep = (millis: number) => new Promise(r => setTimeout(r, millis));
const rand  = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1));

// Füllt das Parkhaus, bis es voll ist
const fill = async (lot: ParkingLot) => {
  while (!lot.isFull()) {
    await sleep(rand(0, maxFillIntervalMillis));
    lot.enter();   // löst notify bei allen Subscribers aus
  }
};

// Leert das Parkhaus, bis es leer ist
const empty = async (lot: ParkingLot) => {
  while (!lot.isEmpty()) {
    await sleep(rand(0, maxEmptyIntervalMillis));
    lot.exit();    // löst notify bei allen Subscribers aus
  }
};

(async () => {
  const bahnhofParking = new ParkingLot("Bahnhof Parking", 100);

  // Display-Subscriber registrieren
  const display = new Display();
  bahnhofParking.subscribe(display);

  // Starte Füll- und Leerprozesse
  const filler = fill(bahnhofParking);

  // Warte initiale Füllphase
  await sleep(initialFillPhaseMillis);

  const emptier = empty(bahnhofParking);

  // Warte, bis beides durchgelaufen ist
  await Promise.all([filler, emptier]);
})();
