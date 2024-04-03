//Object defining gameplay with moves allowed and peg to remove
/*
The 'id' represents the number of the hole from which the peg is selected to be moved.
Based on the peg selected for movement, 'move' will indicate the destination hole for the peg, while 'remove' will indicate the hole from which the adjacent peg should be removed.
*/
const PEG_GAMEPLAY = [
    {
        id: '1',
        moveOptions: [
            {
                move: '3',
                remove: '2'
            },
            {
                move: '10',
                remove: '6'
            }
        ]
    },
    {
        id: '2',
        moveOptions: [
            {
                move: '4',
                remove: '3'
            },
            {
                move: '11',
                remove: '7'
            }
        ]
    },
    {
        id: '3',
        moveOptions: [
            {
                move: '1',
                remove: '2'
            },
            {
                move: '5',
                remove: '4'
            },
            {
                move: '10',
                remove: '7'
            },
            {
                move: '12',
                remove: '8'
            }
        ]
    },
    {
        id: '4',
        moveOptions: [
            {
                move: '2',
                remove: '3'
            },
            {
                move: '11',
                remove: '8'
            }
        ]
    },
    {
        id: '5',
        moveOptions: [
            {
                move: '3',
                remove: '4'
            },
            {
                move: '12',
                remove: '9'
            }
        ]
    },
    {
        id: '6',
        moveOptions: [
            {
                move: '8',
                remove: '7'
            },
            {
                move: '13',
                remove: '10'
            }
        ]
    },
    {
        id: '7',
        moveOptions: [
            {
                move: '9',
                remove: '8'
            },
            {
                move: '14',
                remove: '11'
            }
        ]
    },
    {
        id: '8',
        moveOptions: [
            {
                move: '6',
                remove: '7'
            },
            {
                move: '13',
                remove: '11'
            }
        ]
    },
    {
        id: '9',
        moveOptions: [
            {
                move: '7',
                remove: '8'
            },
            {
                move: '14',
                remove: '12'
            }
        ]
    },
    {
        id: '10',
        moveOptions: [
            {
                move: '1',
                remove: '6'
            },
            {
                move: '3',
                remove: '7'
            },
            {
                move: '12',
                remove: '11'
            },
            {
                move: '15',
                remove: '13'
            }
        ]
    },
    {
        id: '11',
        moveOptions: [
            {
                move: '2',
                remove: '7'
            },
            {
                move: '4',
                remove: '8'
            }
        ]
    },
    {
        id: '12',
        moveOptions: [
            {
                move: '3',
                remove: '8'
            },
            {
                move: '5',
                remove: '9'
            },
            {
                move: '10',
                remove: '11'
            },
            {
                move: '15',
                remove: '14'
            }
        ]
    },
    {
        id: '13',
        moveOptions: [
            {
                move: '6',
                remove: '10'
            },
            {
                move: '8',
                remove: '11'
            }
        ]
    },
    {
        id: '14',
        moveOptions: [
            {
                move: '7',
                remove: '11'
            },
            {
                move: '9',
                remove: '12'
            }
        ]
    },
    {
        id: '15',
        moveOptions: [
            {
                move: '10',
                remove: '13'
            },
            {
                move: '12',
                remove: '14'
            }
        ]
    }
];