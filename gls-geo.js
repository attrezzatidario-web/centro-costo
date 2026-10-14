/* Centro di Costo — coordinate per la mappa GLS
   PROV: sigla -> [lat, lon, regione] (capoluogo di provincia)
   CITY: coordinate precise delle località già spedite (chiave: "CITTÀ|PR" in maiuscolo) */
window.GLS_GEO = {
  PROV: {
    AG: [37.311, 13.576, 'Sicilia'], AL: [44.913, 8.615, 'Piemonte'], AN: [43.617, 13.519, 'Marche'], AO: [45.737, 7.320, "Valle d'Aosta"],
    AP: [42.854, 13.575, 'Marche'], AQ: [42.351, 13.399, 'Abruzzo'], AR: [43.463, 11.880, 'Toscana'], AT: [44.900, 8.207, 'Piemonte'],
    AV: [40.914, 14.790, 'Campania'], BA: [41.117, 16.871, 'Puglia'], BG: [45.698, 9.677, 'Lombardia'], BI: [45.566, 8.054, 'Piemonte'],
    BL: [46.142, 12.217, 'Veneto'], BN: [41.130, 14.782, 'Campania'], BO: [44.494, 11.343, 'Emilia-Romagna'], BR: [40.632, 17.936, 'Puglia'],
    BS: [45.541, 10.212, 'Lombardia'], BT: [41.227, 16.295, 'Puglia'], BZ: [46.498, 11.354, 'Trentino-Alto Adige'], CA: [39.224, 9.121, 'Sardegna'],
    CB: [41.561, 14.668, 'Molise'], CE: [41.072, 14.333, 'Campania'], CH: [42.351, 14.168, 'Abruzzo'], CL: [37.490, 14.062, 'Sicilia'],
    CN: [44.384, 7.543, 'Piemonte'], CO: [45.808, 9.085, 'Lombardia'], CR: [45.133, 10.023, 'Lombardia'], CS: [39.298, 16.254, 'Calabria'],
    CT: [37.502, 15.087, 'Sicilia'], CZ: [38.906, 16.594, 'Calabria'], EN: [37.567, 14.279, 'Sicilia'], FC: [44.222, 12.041, 'Emilia-Romagna'],
    FE: [44.838, 11.620, 'Emilia-Romagna'], FG: [41.462, 15.545, 'Puglia'], FI: [43.770, 11.256, 'Toscana'], FM: [43.160, 13.718, 'Marche'],
    FR: [41.640, 13.342, 'Lazio'], GE: [44.405, 8.946, 'Liguria'], GO: [45.941, 13.622, 'Friuli-Venezia Giulia'], GR: [42.760, 11.113, 'Toscana'],
    IM: [43.889, 8.039, 'Liguria'], IS: [41.594, 14.233, 'Molise'], KR: [39.081, 17.127, 'Calabria'], LC: [45.856, 9.393, 'Lombardia'],
    LE: [40.352, 18.172, 'Puglia'], LI: [43.548, 10.311, 'Toscana'], LO: [45.314, 9.503, 'Lombardia'], LT: [41.468, 12.904, 'Lazio'],
    LU: [43.843, 10.505, 'Toscana'], MB: [45.584, 9.274, 'Lombardia'], MC: [43.300, 13.453, 'Marche'], ME: [38.194, 15.554, 'Sicilia'],
    MI: [45.464, 9.190, 'Lombardia'], MN: [45.157, 10.792, 'Lombardia'], MO: [44.647, 10.925, 'Emilia-Romagna'], MS: [44.035, 10.140, 'Toscana'],
    MT: [40.666, 16.604, 'Basilicata'], NA: [40.852, 14.268, 'Campania'], NO: [45.446, 8.622, 'Piemonte'], NU: [40.321, 9.330, 'Sardegna'],
    OR: [39.904, 8.592, 'Sardegna'], PA: [38.116, 13.361, 'Sicilia'], PC: [45.052, 9.693, 'Emilia-Romagna'], PD: [45.406, 11.877, 'Veneto'],
    PE: [42.464, 14.214, 'Abruzzo'], PG: [43.111, 12.389, 'Umbria'], PI: [43.716, 10.402, 'Toscana'], PN: [45.956, 12.660, 'Friuli-Venezia Giulia'],
    PO: [43.880, 11.097, 'Toscana'], PR: [44.801, 10.328, 'Emilia-Romagna'], PT: [43.933, 10.917, 'Toscana'], PU: [43.910, 12.913, 'Marche'],
    PV: [45.185, 9.158, 'Lombardia'], PZ: [40.640, 15.806, 'Basilicata'], RA: [44.418, 12.204, 'Emilia-Romagna'], RC: [38.110, 15.661, 'Calabria'],
    RE: [44.698, 10.631, 'Emilia-Romagna'], RG: [36.926, 14.725, 'Sicilia'], RI: [42.404, 12.857, 'Lazio'], RM: [41.902, 12.496, 'Lazio'],
    RN: [44.060, 12.566, 'Emilia-Romagna'], RO: [45.070, 11.790, 'Veneto'], SA: [40.682, 14.768, 'Campania'], SI: [43.318, 11.331, 'Toscana'],
    SO: [46.170, 9.879, 'Lombardia'], SP: [44.102, 9.824, 'Liguria'], SR: [37.075, 15.287, 'Sicilia'], SS: [40.726, 8.560, 'Sardegna'],
    SU: [39.167, 8.522, 'Sardegna'], SV: [44.309, 8.477, 'Liguria'], TA: [40.464, 17.247, 'Puglia'], TE: [42.659, 13.704, 'Abruzzo'],
    TN: [46.067, 11.121, 'Trentino-Alto Adige'], TO: [45.070, 7.687, 'Piemonte'], TP: [38.017, 12.537, 'Sicilia'], TR: [42.563, 12.643, 'Umbria'],
    TS: [45.650, 13.777, 'Friuli-Venezia Giulia'], TV: [45.667, 12.243, 'Veneto'], UD: [46.063, 13.235, 'Friuli-Venezia Giulia'], VA: [45.820, 8.825, 'Lombardia'],
    VB: [45.921, 8.551, 'Piemonte'], VC: [45.320, 8.419, 'Piemonte'], VE: [45.441, 12.316, 'Veneto'], VI: [45.548, 11.548, 'Veneto'],
    VR: [45.438, 10.992, 'Veneto'], VT: [42.417, 12.105, 'Lazio'], VV: [38.676, 16.101, 'Calabria']
  },
  CITY: {
    'ABBIATEGRASSO|MI': [45.398, 8.918], 'BARGELLINO|BO': [44.530, 11.250], 'CALDERARA DI RENO|BO': [44.565, 11.272], 'CATANZARO|CZ': [38.906, 16.594],
    'CHIERI|TO': [45.012, 7.825], 'CITTADELLA|PD': [45.648, 11.784], "CITTÀ SANT'ANGELO|PE": [42.518, 14.059], 'CORROPOLI|TE': [42.827, 13.839],
    'FERRERE|AT': [44.877, 7.995], 'FORNACE ZARATTINI|RA': [44.405, 12.143], 'GORGONZOLA|MI': [45.532, 9.405], 'GRAGNANO TREBBIENSE|PC': [45.013, 9.570],
    'MAGIONE|PG': [43.142, 12.204], 'MEZZOLOMBARDO|TN': [46.213, 11.093], 'MILETO|VV': [38.607, 16.067], 'MONTESCUDO-MONTE COLOMBO|RN': [43.920, 12.540],
    'NEVIANO DEGLI ARDUINI|PR': [44.583, 10.317], 'OSPEDALETTO|PI': [43.687, 10.430], 'PISA|PI': [43.716, 10.402], 'POMEZIA|RM': [41.669, 12.501],
    "QUARTO D'ALTINO|VE": [45.578, 12.372], 'ROMA|RM': [41.902, 12.496], 'ROVIGO|RO': [45.070, 11.790], 'SAN BONIFACIO|VR': [45.396, 11.274],
    'SAN CESAREO|RM': [41.820, 12.800], 'SAN PIETRO VERNOTICO|BR': [40.489, 18.009], 'SCHIO|VI': [45.713, 11.358], 'TAVERNA DI MONTE COLOMBO|RN': [43.948, 12.530],
    'VENEZIA|VE': [45.441, 12.316], 'VOLPIANO|TO': [45.201, 7.776]
  }
};
