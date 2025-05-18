# Étterem Foglalási Rendszer

## Projekt

Ez az étterem foglalási rendszer egy MEAN stack alapú projekt, amely lehetővé teszi éttermek és vendégek számára a foglalások egyszerű kezelését. A rendszer TypeScript-alapú és a MongoDB, Express.js, Angular és Node.js technológiákat használja.

## Funkciók

### Felhasználók számára
* Regisztráció és bejelentkezés
* Éttermek böngészése és keresése
* Éttermek részletes adatainak megtekintése
* Asztalfoglalás adott étteremben kiválasztott időpontra
* Saját foglalások áttekintése
* Foglalások lemondása és módosítása
* Személyes profil kezelése

### Étteremtulajdonosok (adminok) számára
* Éttermek létrehozása és kezelése
* Időpontok (time slots) létrehozása és kezelése
* Foglalások áttekintése és állapotuk módosítása
* Éttermek adatainak frissítése

### Telepítés és futtatás

```bash
git clone https://github.com/Etam2003/restaurant.git
```

.env fájl létrehozása, ha szükséges

```bash
npm run dev
```