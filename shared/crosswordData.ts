import { CluePrivate, CluePublic, GridCell } from './types.js';

export const GRID_ROWS = 13;
export const GRID_COLS = 19;

export const COMPUTER_NETWORKS_CLUES: CluePrivate[] = [
  // Down clues
  {
    id: 14,
    number: 1,
    direction: 'down',
    answer: 'DNS',
    clue: 'Hierarchical distributed database operating on UDP port 53 vulnerable to Kaminsky cache poisoning that maps FQDNs to resource records',
    length: 3,
    row: 0,
    col: 6,
  },
  {
    id: 17,
    number: 2,
    direction: 'down',
    answer: 'LAN',
    clue: 'High-speed, low-latency network topology confined to a single broadcast domain bounded by IEEE 802.3 Ethernet or 802.11 standards',
    length: 3,
    row: 0,
    col: 9,
  },
  {
    id: 2,
    number: 3,
    direction: 'down',
    answer: 'MAC',
    clue: '48-bit link-layer physical identifier (EUI-48) whose most significant 24 bits designate the IEEE Organizationally Unique Identifier (OUI)',
    length: 3,
    row: 1,
    col: 4,
  },
  {
    id: 20,
    number: 5,
    direction: 'down',
    answer: 'UDP',
    clue: 'RFC 768 minimalist transport protocol providing process-to-process demultiplexing and 16-bit checksum verification without congestion control',
    length: 3,
    row: 2,
    col: 7,
  },
  {
    id: 18,
    number: 6,
    direction: 'down',
    answer: 'TCP',
    clue: 'Stream-oriented transport protocol featuring 3-way handshakes, cumulative ACKs, Reno/CUBIC congestion avoidance, and TIME_WAIT state',
    length: 3,
    row: 2,
    col: 11,
  },
  {
    id: 11,
    number: 8,
    direction: 'down',
    answer: 'FIREWALL',
    clue: 'Stateful security barrier inspecting connection states in TCP/UDP tracking tables and enforcing Layer 3 to 7 access control lists (ACLs)',
    length: 8,
    row: 4,
    col: 9,
  },
  {
    id: 3,
    number: 9,
    direction: 'down',
    answer: 'HTTPS',
    clue: 'Secure application scheme layered over TLS/SSL (default TCP port 443) employing asymmetric key exchange (RSA/ECDHE) and symmetric AES encryption',
    length: 5,
    row: 4,
    col: 16,
  },
  {
    id: 13,
    number: 11,
    direction: 'down',
    answer: 'PING',
    clue: 'Diagnostic network utility transmitting ICMP Type 8 Echo Request datagrams and listening for Type 0 Echo Replies to calculate RTT and packet loss',
    length: 4,
    row: 6,
    col: 11,
  },
  {
    id: 10,
    number: 12,
    direction: 'down',
    answer: 'DHCP',
    clue: 'Bootstrap protocol evolution executing a 4-step DORA exchange (Discover, Offer, Request, Acknowledge) over UDP ports 67 and 68',
    length: 4,
    row: 8,
    col: 7,
  },
  {
    id: 7,
    number: 15,
    direction: 'down',
    answer: 'HTTP',
    clue: 'Stateless application protocol specified by RFC 2616 utilizing ASCII request headers and idempotent methods (GET, HEAD, PUT) over TCP port 80',
    length: 4,
    row: 9,
    col: 5,
  },

  // Across clues
  {
    id: 4,
    number: 3,
    direction: 'across',
    answer: 'MAN',
    clue: 'High-speed municipal network infrastructure often deployed with Metro Ethernet, DQDB (IEEE 802.6), or dark fiber spanning a town or campus',
    length: 3,
    row: 1,
    col: 4,
  },
  {
    id: 9,
    number: 4,
    direction: 'across',
    answer: 'SUBNET',
    clue: 'CIDR technique of borrowing contiguous host bits in an IP address space to subdivide a broadcast domain into smaller routing segments',
    length: 6,
    row: 2,
    col: 6,
  },
  {
    id: 12,
    number: 7,
    direction: 'across',
    answer: 'IP',
    clue: 'Core network-layer protocol providing best-effort, connectionless datagram delivery and 32-bit (v4) or 128-bit (v6) hierarchical addressing',
    length: 2,
    row: 4,
    col: 6,
  },
  {
    id: 5,
    number: 8,
    direction: 'across',
    answer: 'FTP',
    clue: 'Dual-port application protocol decoupling control commands on TCP port 21 from active/passive bulk data transfer streams on TCP port 20',
    length: 3,
    row: 4,
    col: 9,
  },
  {
    id: 19,
    number: 9,
    direction: 'across',
    answer: 'HUB',
    clue: 'Legacy Layer 1 multi-port physical repeater operating purely in half-duplex where every connected node shares one single collision domain',
    length: 3,
    row: 4,
    col: 16,
  },
  {
    id: 15,
    number: 10,
    direction: 'across',
    answer: 'ROUTER',
    clue: 'Layer 3 forwarding system that decrements IPv4 TTL, recalculates checksums, looks up FIB routing tables, and delineates broadcast domains',
    length: 6,
    row: 6,
    col: 4,
  },
  {
    id: 1,
    number: 11,
    direction: 'across',
    answer: 'PACKET',
    clue: 'Layer 3 Protocol Data Unit (PDU) formed when transport-layer segments are encapsulated with network-layer addressing and routing metadata',
    length: 6,
    row: 6,
    col: 11,
  },
  {
    id: 6,
    number: 13,
    direction: 'across',
    answer: 'WAN',
    clue: 'Geographically dispersed telecommunication network spanning cities or nations utilizing leased lines, MPLS circuits, Frame Relay, or satellite links',
    length: 3,
    row: 8,
    col: 9,
  },
  {
    id: 16,
    number: 14,
    direction: 'across',
    answer: 'SWITCH',
    clue: 'Layer 2 forwarding hardware that performs frame filtering and forwarding by learning source MAC addresses into a Content-Addressable Memory (CAM) table',
    length: 6,
    row: 9,
    col: 0,
  },
  {
    id: 8,
    number: 16,
    direction: 'across',
    answer: 'TOPOLOGY',
    clue: 'Graph-theoretic geometric or logical layout describing node adjacencies and interconnecting communication links (e.g., mesh, star, bus, ring)',
    length: 8,
    row: 11,
    col: 5,
  },
];

// Generate Grid Cells without leaking answers
export function buildGridCells(): GridCell[][] {
  const cells: GridCell[][] = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      row.push({
        row: r,
        col: c,
        isPlayable: false,
      });
    }
    cells.push(row);
  }

  // Mark clue start and cells
  for (const clue of COMPUTER_NETWORKS_CLUES) {
    const startCell = cells[clue.row][clue.col];
    startCell.clueNumber = clue.number;

    for (let i = 0; i < clue.length; i++) {
      const cr = clue.row + (clue.direction === 'down' ? i : 0);
      const cc = clue.col + (clue.direction === 'across' ? i : 0);
      const targetCell = cells[cr][cc];
      targetCell.isPlayable = true;

      if (clue.direction === 'across') {
        targetCell.acrossClueId = clue.id;
      } else {
        targetCell.downClueId = clue.id;
      }
    }
  }

  return cells;
}

// Return public clue list without answers for security
export function getPublicClues(): CluePublic[] {
  return COMPUTER_NETWORKS_CLUES.map((c) => ({
    id: c.id,
    number: c.number,
    direction: c.direction,
    clue: c.clue,
    length: c.length,
    row: c.row,
    col: c.col,
  })).sort((a, b) => a.number - b.number);
}
