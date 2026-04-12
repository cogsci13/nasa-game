export interface TrackerSatelliteMeta {
  id: number
  name: string
  label: string
  emoji: string
  color: string
}

export const TRACKED_SATELLITES: TrackerSatelliteMeta[] = [
  { id: 25544, name: 'ISS', label: '국제우주정거장', emoji: '🛸', color: '#4fc3f7' },
  { id: 20580, name: 'Hubble', label: '허블 우주망원경', emoji: '🔭', color: '#ce93d8' },
  { id: 48274, name: 'Tiangong', label: '텐궁 (중국 우주정거장)', emoji: '🚀', color: '#ef9a9a' },
]
