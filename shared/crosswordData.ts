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
    clue: 'Translates domain names (like google.com) into IP addresses (abbr.)',
    length: 3,
    row: 0,
    col: 6,
  },
  {
    id: 17,
    number: 2,
    direction: 'down',
    answer: 'LAN',
    clue: 'A network connecting devices within a small area like a home, office, or school (abbr.)',
    length: 3,
    row: 0,
    col: 9,
  },
  {
    id: 2,
    number: 3,
    direction: 'down',
    answer: 'MAC',
    clue: 'Physical hardware address permanently assigned to a network interface card (___ address)',
    length: 3,
    row: 1,
    col: 4,
  },
  {
    id: 20,
    number: 5,
    direction: 'down',
    answer: 'UDP',
    clue: 'Fast, connectionless transport protocol commonly used for real-time video and gaming (abbr.)',
    length: 3,
    row: 2,
    col: 7,
  },
  {
    id: 18,
    number: 6,
    direction: 'down',
    answer: 'TCP',
    clue: 'Reliable, connection-oriented transport protocol that performs a 3-way handshake (abbr.)',
    length: 3,
    row: 2,
    col: 11,
  },
  {
    id: 11,
    number: 8,
    direction: 'down',
    answer: 'FIREWALL',
    clue: 'Security system that monitors and blocks unauthorized incoming and outgoing network traffic',
    length: 8,
    row: 4,
    col: 9,
  },
  {
    id: 3,
    number: 9,
    direction: 'down',
    answer: 'HTTPS',
    clue: 'Secure and encrypted web browsing protocol indicated by a padlock icon in browsers',
    length: 5,
    row: 4,
    col: 16,
  },
  {
    id: 13,
    number: 11,
    direction: 'down',
    answer: 'PING',
    clue: 'Basic diagnostic tool/command used to check if a remote computer or server is reachable',
    length: 4,
    row: 6,
    col: 11,
  },
  {
    id: 10,
    number: 12,
    direction: 'down',
    answer: 'DHCP',
    clue: 'Protocol that automatically assigns IP addresses to devices when they join a network (abbr.)',
    length: 4,
    row: 8,
    col: 7,
  },
  {
    id: 7,
    number: 15,
    direction: 'down',
    answer: 'HTTP',
    clue: 'Foundational protocol used for transmitting web pages across the internet (port 80)',
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
    clue: 'A network that spans an entire town, city, or large campus (abbr.)',
    length: 3,
    row: 1,
    col: 4,
  },
  {
    id: 9,
    number: 4,
    direction: 'across',
    answer: 'SUBNET',
    clue: 'A smaller, logically segmented portion of a larger IP network',
    length: 6,
    row: 2,
    col: 6,
  },
  {
    id: 12,
    number: 7,
    direction: 'across',
    answer: 'IP',
    clue: 'Unique numerical address identifying every connected device on a network (abbr.)',
    length: 2,
    row: 4,
    col: 6,
  },
  {
    id: 5,
    number: 8,
    direction: 'across',
    answer: 'FTP',
    clue: 'Protocol dedicated to transferring and uploading files between a client and server (abbr.)',
    length: 3,
    row: 4,
    col: 9,
  },
  {
    id: 19,
    number: 9,
    direction: 'across',
    answer: 'HUB',
    clue: 'Simple legacy networking hardware that blindly broadcasts all received data to every port',
    length: 3,
    row: 4,
    col: 16,
  },
  {
    id: 15,
    number: 10,
    direction: 'across',
    answer: 'ROUTER',
    clue: 'Networking device that connects multiple networks together and routes traffic between them',
    length: 6,
    row: 6,
    col: 4,
  },
  {
    id: 1,
    number: 11,
    direction: 'across',
    answer: 'PACKET',
    clue: 'A small piece or unit of data transmitted over a computer network',
    length: 6,
    row: 6,
    col: 11,
  },
  {
    id: 6,
    number: 13,
    direction: 'across',
    answer: 'WAN',
    clue: 'Wide area network that spans across vast distances, countries, or the globe (abbr.)',
    length: 3,
    row: 8,
    col: 9,
  },
  {
    id: 16,
    number: 14,
    direction: 'across',
    answer: 'SWITCH',
    clue: 'Intelligent network device that forwards data frames directly to target devices using MAC addresses',
    length: 6,
    row: 9,
    col: 0,
  },
  {
    id: 8,
    number: 16,
    direction: 'across',
    answer: 'TOPOLOGY',
    clue: 'The physical or logical layout and structure of a network (e.g., star, ring, bus, mesh)',
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
