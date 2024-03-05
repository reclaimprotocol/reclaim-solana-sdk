export type Airdrop = {
  version: "0.1.0";
  name: "airdrop";
  instructions: [
    {
      name: "initAirdrop";
      accounts: [
        {
          name: "airdrop";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: true;
          isSigner: true;
        },
        {
          name: "managerTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "InitAirdropArgs";
          };
        }
      ];
    },
    {
      name: "claimAirdrop";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "airdrop";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "managerTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "signerTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "epochConfig";
          isMut: false;
          isSigner: false;
        },
        {
          name: "epoch";
          isMut: false;
          isSigner: false;
        },
        {
          name: "reclaimProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "ClaimAirdropArgs";
          };
        }
      ];
    }
  ];
  accounts: [
    {
      name: "airdrop";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "managerTokenAccount";
            type: "publicKey";
          },
          {
            name: "tokensRemaining";
            type: "u64";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "InitAirdropArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "mintAmount";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "ClaimAirdropArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "claimInfo";
            type: {
              defined: "ClaimInfo";
            };
          },
          {
            name: "signedClaim";
            type: {
              defined: "SignedClaim";
            };
          }
        ];
      };
    },
    {
      name: "SignedClaim";
      type: {
        kind: "struct";
        fields: [
          {
            name: "claimData";
            type: {
              defined: "ClaimData";
            };
          },
          {
            name: "signatures";
            type: {
              vec: {
                array: ["u8", 65];
              };
            };
          }
        ];
      };
    },
    {
      name: "ClaimInfo";
      type: {
        kind: "struct";
        fields: [
          {
            name: "provider";
            type: "string";
          },
          {
            name: "parameters";
            type: "string";
          },
          {
            name: "contextAddress";
            type: "publicKey";
          },
          {
            name: "contextMessage";
            type: "string";
          }
        ];
      };
    },
    {
      name: "ClaimData";
      type: {
        kind: "struct";
        fields: [
          {
            name: "identifier";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "owner";
            type: "string";
          },
          {
            name: "timestamp";
            type: "u32";
          },
          {
            name: "epochIndex";
            type: "u32";
          }
        ];
      };
    }
  ];
};

export const IDL: Airdrop = {
  version: "0.1.0",
  name: "airdrop",
  instructions: [
    {
      name: "initAirdrop",
      accounts: [
        {
          name: "airdrop",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: true,
          isSigner: true,
        },
        {
          name: "managerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "InitAirdropArgs",
          },
        },
      ],
    },
    {
      name: "claimAirdrop",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "airdrop",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "managerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "signerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "epochConfig",
          isMut: false,
          isSigner: false,
        },
        {
          name: "epoch",
          isMut: false,
          isSigner: false,
        },
        {
          name: "reclaimProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "ClaimAirdropArgs",
          },
        },
      ],
    },
  ],
  accounts: [
    {
      name: "airdrop",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "managerTokenAccount",
            type: "publicKey",
          },
          {
            name: "tokensRemaining",
            type: "u64",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "InitAirdropArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "mintAmount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "ClaimAirdropArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "claimInfo",
            type: {
              defined: "ClaimInfo",
            },
          },
          {
            name: "signedClaim",
            type: {
              defined: "SignedClaim",
            },
          },
        ],
      },
    },
    {
      name: "SignedClaim",
      type: {
        kind: "struct",
        fields: [
          {
            name: "claimData",
            type: {
              defined: "ClaimData",
            },
          },
          {
            name: "signatures",
            type: {
              vec: {
                array: ["u8", 65],
              },
            },
          },
        ],
      },
    },
    {
      name: "ClaimInfo",
      type: {
        kind: "struct",
        fields: [
          {
            name: "provider",
            type: "string",
          },
          {
            name: "parameters",
            type: "string",
          },
          {
            name: "contextAddress",
            type: "publicKey",
          },
          {
            name: "contextMessage",
            type: "string",
          },
        ],
      },
    },
    {
      name: "ClaimData",
      type: {
        kind: "struct",
        fields: [
          {
            name: "identifier",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "owner",
            type: "string",
          },
          {
            name: "timestamp",
            type: "u32",
          },
          {
            name: "epochIndex",
            type: "u32",
          },
        ],
      },
    },
  ],
};
