import { describe, it, expect } from "vitest";
import { parseGpx } from "./gpx";

const SAMPLE_GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Rittner Horn Runde</name>
    <trkseg>
      <trkpt lat="46.5400" lon="11.4700"><ele>1200</ele><time>2024-08-01T08:00:00Z</time></trkpt>
      <trkpt lat="46.5450" lon="11.4720"><ele>1260</ele><time>2024-08-01T08:10:00Z</time></trkpt>
      <trkpt lat="46.5500" lon="11.4750"><ele>1330</ele><time>2024-08-01T08:25:00Z</time></trkpt>
    </trkseg>
  </trk>
</gpx>`;

describe("parseGpx", () => {
  it("liest Name, Startzeit und Punkte ([lat,lng,ele])", () => {
    const result = parseGpx(SAMPLE_GPX);
    expect(result.name).toBe("Rittner Horn Runde");
    expect(result.points).toHaveLength(3);
    expect(result.points[0]).toEqual([46.54, 11.47, 1200]);
    expect(result.points[2][2]).toBe(1330);
    expect(result.startTime).toBe("2024-08-01T08:00:00Z");
  });

  it("kommt mit GPX ohne Höhen klar", () => {
    const noEle = `<?xml version="1.0"?><gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg>
      <trkpt lat="46.54" lon="11.47"></trkpt>
      <trkpt lat="46.55" lon="11.48"></trkpt>
    </trkseg></trk></gpx>`;
    const result = parseGpx(noEle);
    expect(result.points).toHaveLength(2);
    expect(result.points[0]).toEqual([46.54, 11.47]);
  });
});
