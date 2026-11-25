/**
 * Fictional demo data for the demo mode (no Supabase configured).
 * All names, addresses and VINs are made up.
 */
import type { CarRow } from '../../types/Car';
import type { ClientRow } from '../../types/Client';

export type DemoRow = Record<string, unknown> & { id: string };

export type DemoDb = {
    cars: DemoRow[];
    clients: DemoRow[];
    contracts: DemoRow[];
};

const daysAgo = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
};

const ts = (days: number): string => `${daysAgo(days)}T10:00:00.000Z`;

const car = (
    nr: number,
    fahrzeug: string,
    vin: string,
    ez: string,
    farbe: string,
    einkaufspreis: number,
    verkaufspreis: number | null,
    status: 'In Stock' | 'Reserved' | 'Sold',
    boughtDaysAgo: number,
    soldDaysAgo: number | null = null,
): CarRow => ({
    id: `car-${nr}`,
    nr,
    kaufdatum: daysAgo(boughtDaysAgo),
    fahrzeug,
    vin,
    kfz_brief_nr: `AB${String(100000 + nr * 7919).slice(0, 6)}`,
    ez,
    farbe,
    einkaufspreis,
    verkaufspreis,
    verkaufsdatum: soldDaysAgo === null ? null : daysAgo(soldDaysAgo),
    status,
    created_at: ts(boughtDaysAgo),
});

const cars: CarRow[] = [
    car(1, 'VW Golf VII 1.4 TSI', 'WVWZZZAUZFW000101', '2015-03-12', 'Silber', 7800, 10490, 'Sold', 170, 150),
    car(2, 'BMW 320d Touring (F31)', 'WBA8E11050K000202', '2016-07-04', 'Schwarz', 11200, 14900, 'Sold', 140, 118),
    car(3, 'Audi A4 Avant 2.0 TDI', 'WAUZZZ8K5DA000303', '2013-05-20', 'Grau', 6900, 9300, 'Sold', 120, 95),
    car(4, 'Skoda Octavia Combi 1.6 TDI', 'TMBJJ7NE0G0000404', '2016-01-15', 'Weiß', 8500, 11200, 'Sold', 90, 64),
    car(5, 'Mercedes-Benz C 200 (W205)', 'WDD2050421F000505', '2015-09-30', 'Blau', 13900, 17800, 'Sold', 75, 33),
    car(6, 'Opel Astra K 1.0 Turbo', 'W0LBD6EB3HG000606', '2017-02-08', 'Rot', 6200, 8490, 'Sold', 50, 12),
    car(7, 'Ford Focus Turnier 1.5 EcoBoost', 'WF06XXGCC6HA00707', '2017-06-22', 'Weiß', 7400, 9790, 'In Stock', 40),
    car(8, 'Toyota Yaris 1.5 Hybrid', 'VNKKD3D3X0A000808', '2018-04-11', 'Silber', 8900, 11490, 'In Stock', 30),
    car(9, 'Renault Clio IV 0.9 TCe', 'VF15RBJ0D58000909', '2016-10-03', 'Gelb', 4300, 6290, 'In Stock', 25),
    car(10, 'Hyundai i30 1.4 T-GDI', 'TMAH381AAJJ001010', '2018-08-27', 'Grau', 9600, 12690, 'Reserved', 18),
    car(11, 'VW Passat Variant 2.0 TDI', 'WVWZZZ3CZJE001111', '2018-03-19', 'Schwarz', 12800, 16490, 'In Stock', 10),
    car(12, 'Seat Leon ST 1.5 TSI', 'VSSZZZ5FZKR001212', '2019-01-09', 'Blau', 11900, 14990, 'In Stock', 6),
    car(13, 'Kia Ceed SW 1.6 CRDi', 'U5YH5811AKL001313', '2019-05-14', 'Weiß', 10400, null, 'In Stock', 2),
];

const client = (nr: number, name: string, postal_code: string, city: string, address: string): ClientRow => ({
    id: `client-${nr}`,
    nr,
    name,
    postal_code,
    city,
    address,
    created_at: ts(180 - nr * 10),
});

const clients: ClientRow[] = [
    client(1, 'Max Mustermann', '10115', 'Berlin', 'Musterstraße 12'),
    client(2, 'Erika Beispiel', '20095', 'Hamburg', 'Hafenweg 3'),
    client(3, 'Jan Kowalski', '50-001', 'Wrocław (PL)', 'ul. Przykładowa 8'),
    client(4, 'Anna Schneider', '80331', 'München', 'Lindenallee 45'),
    client(5, 'Lukas Weber', '04109', 'Leipzig', 'Am Markt 7'),
    client(6, 'Piotr Nowak', '00-950', 'Warszawa (PL)', 'ul. Testowa 21'),
];

const contract = (
    nr: number,
    carNr: number,
    clientNr: number,
    price: number,
    soldDaysAgo: number,
    exportDestination: 'inland' | 'eu' | 'third' | null,
    extra: Partial<DemoRow> = {},
): DemoRow => ({
    id: `contract-${nr}`,
    nr,
    contract_date: daysAgo(soldDaysAgo),
    car_id: `car-${carNr}`,
    client_id: `client-${clientNr}`,
    price,
    tax_included: exportDestination === 'inland',
    seller_statement_key: JSON.stringify(['no_accident']),
    buyer_receives_flags: [
        'Zulassungsbescheinigung Teil 1, Teil 2 und der Bescheinigung über die letzte Haupt- und Abgasuntersuchung',
        'des Kfz mit 2 Schlüsseln',
    ],
    keys_count: 2,
    export_destination: exportDestination,
    eu_with_tax: null,
    eu_tax_number: null,
    third_with_customs: null,
    third_customs_number: null,
    created_at: ts(soldDaysAgo),
    ...extra,
});

const contracts: DemoRow[] = [
    contract(1, 1, 1, 10490, 150, 'inland'),
    contract(2, 2, 2, 14900, 118, 'inland'),
    contract(3, 3, 3, 9300, 95, 'eu', { eu_with_tax: true, eu_tax_number: 'PL0000000000' }),
    contract(4, 4, 4, 11200, 64, 'inland'),
    contract(5, 5, 6, 17800, 33, 'eu', { eu_with_tax: false }),
    contract(6, 6, 5, 8490, 12, 'inland'),
];

export function createDemoDb(): DemoDb {
    return structuredClone({ cars, clients, contracts }) as DemoDb;
}
