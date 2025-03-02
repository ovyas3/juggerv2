interface ShipperDetail {
  city: string
  rate?: number
  tonnage: number
  trips: number
  shipper: {
    $oid: string
  }
}

interface ShipmentData {
  _id: {
    $oid: string
  }
  city: string
  tonnage: number
  trips: number
  details: ShipperDetail[]
  shipper: {
    $oid: string
  }
}

export const mockCityData: ShipmentData[] = [
  {
    _id: {
      $oid: "67c3ae4052b3bb33c84e8c88",
    },
    city: "PATRATU",
    tonnage: 606132.72,
    trips: 14921,
    details: [
      {
        city: "PATRATU",
        rate: 1961,
        tonnage: 108133.64,
        trips: 2695,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PATRATU",
        rate: 1943,
        tonnage: 250130.58,
        trips: 6153,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PATRATU",
        rate: 1776,
        tonnage: 124.24000000000001,
        trips: 3,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PATRATU",
        rate: 1800,
        tonnage: 174042.8,
        trips: 4245,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PATRATU",
        rate: 1850,
        tonnage: 786.74,
        trips: 19,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PATRATU",
        rate: 1705,
        tonnage: 0,
        trips: 1,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PATRATU",
        rate: 3214,
        tonnage: 41.26,
        trips: 1,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PATRATU",
        tonnage: 0,
        trips: 11,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PATRATU",
        rate: 1785,
        tonnage: 1330.16,
        trips: 37,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PATRATU",
        rate: 1960,
        tonnage: 40017.96,
        trips: 984,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PATRATU",
        rate: 1960.93,
        tonnage: 364.9,
        trips: 9,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PATRATU",
        rate: 1749,
        tonnage: 82.38,
        trips: 2,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PATRATU",
        rate: 1841,
        tonnage: 41.54,
        trips: 1,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PATRATU",
        rate: 1740,
        tonnage: 31036.52,
        trips: 760,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
    ],
    shipper: {
      $oid: "623c963e33526eee0419a399",
    },
  },
  {
    _id: {
      $oid: "67c3ae4052b3bb33c84e8c89",
    },
    city: "PARADEEP",
    tonnage: 125805.12299999999,
    trips: 3312,
    details: [
      {
        city: "PARADEEP",
        rate: 658,
        tonnage: 39.516,
        trips: 1,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PARADEEP",
        rate: 307,
        tonnage: 39.054,
        trips: 1,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PARADEEP",
        tonnage: 0,
        trips: 14,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PARADEEP",
        rate: 1042,
        tonnage: 46555.763,
        trips: 1218,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PARADEEP",
        rate: 1000,
        tonnage: 28859.874,
        trips: 747,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PARADEEP",
        rate: 1051,
        tonnage: 46105.199,
        trips: 1215,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PARADEEP",
        rate: 2990,
        tonnage: 1702.621,
        trips: 45,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PARADEEP",
        rate: 1825,
        tonnage: 0,
        trips: 1,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PARADEEP",
        rate: 1067,
        tonnage: 2464.508,
        trips: 69,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
      {
        city: "PARADEEP",
        rate: 1943,
        tonnage: 38.588,
        trips: 1,
        shipper: {
          $oid: "623c963e33526eee0419a399",
        },
      },
    ],
    shipper: {
      $oid: "623c963e33526eee0419a399",
    },
  },
]

