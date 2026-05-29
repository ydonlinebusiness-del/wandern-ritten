/**
 * Startliste markanter Highlights am Ritten. Koordinaten sind Näherungen –
 * können in der DB jederzeit verfeinert werden.
 */
export interface PoiSeed {
  name: string;
  type: "peak" | "lake" | "village" | "sight" | "cablecar" | "highlight";
  lat: number;
  lng: number;
  elevationM?: number;
  description?: string;
}

export const RITTEN_POIS: PoiSeed[] = [
  { name: "Rittner Horn", type: "peak", lat: 46.6175, lng: 11.4608, elevationM: 2260, description: "Hausberg des Ritten mit Panoramablick auf die Dolomiten." },
  { name: "Schwarzseespitze", type: "peak", lat: 46.609, lng: 11.470, elevationM: 2073, description: "Aussichtsgipfel beim Rittner Horn." },
  { name: "Erdpyramiden Lengmoos", type: "sight", lat: 46.546, lng: 11.483, description: "Markante Erosionssäulen – Wahrzeichen des Ritten." },
  { name: "Erdpyramiden Soprabolzano/Oberbozen", type: "sight", lat: 46.526, lng: 11.414, description: "Weitere Erdpyramiden nahe Oberbozen." },
  { name: "Wolfsgrubener See", type: "lake", lat: 46.5205, lng: 11.4297, elevationM: 1170, description: "Idyllischer Badesee (Costalovara)." },
  { name: "Freud-Promenade", type: "highlight", lat: 46.530, lng: 11.430, description: "Historischer Spazierweg Oberbozen–Klobenstein." },
  { name: "Klobenstein (Collalbo)", type: "village", lat: 46.5395, lng: 11.4566, elevationM: 1154, description: "Hauptort der Gemeinde Ritten." },
  { name: "Oberbozen (Soprabolzano)", type: "village", lat: 46.5232, lng: 11.4047, elevationM: 1221, description: "Bergstation der Rittner Seilbahn." },
  { name: "Unterinn (Auna di Sotto)", type: "village", lat: 46.5036, lng: 11.4581, description: "Fraktion der Gemeinde Ritten." },
  { name: "Wangen (Vanga)", type: "village", lat: 46.561, lng: 11.498, description: "Fraktion im Osten des Ritten." },
  { name: "Pemmern – Talstation Rittner-Horn-Bahn", type: "cablecar", lat: 46.5807, lng: 11.4736, description: "Seilbahn zum Rittner Horn." },
  { name: "Rittner Seilbahn (Bozen–Oberbozen)", type: "cablecar", lat: 46.5232, lng: 11.4047, description: "Verbindung von Bozen auf den Ritten." },
  { name: "Rittner Schmalspurbahn", type: "sight", lat: 46.534, lng: 11.445, description: "Historische Schmalspurbahn Maria Himmelfahrt–Klobenstein." },
];
