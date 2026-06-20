export type Category =
  | "Linux"
  | "Docker"
  | "Terraform"
  | "Network"
  | "Security"
  | "Azure"
  | "Kubernetes";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface CommandCard {
  id: string;
  command: string;
  category: Category;
  description: string;
  example: string;
  whenToUse: string;
  difficulty: Difficulty;
  power: number; // 1-100
  deck: string;
  quiz: { question: string; answer: string; explanation: string };
}

export const STARTER_DECKS = [
  "Linux Basics",
  "Docker Basics",
  "Terraform Basics",
  "Network Troubleshooting",
  "Security Commands",
] as const;

export const CATEGORY_COLOR: Record<Category, string> = {
  Linux: "var(--cat-linux)",
  Docker: "var(--cat-docker)",
  Terraform: "var(--cat-terraform)",
  Network: "var(--cat-network)",
  Security: "var(--cat-security)",
  Azure: "var(--cat-azure)",
  Kubernetes: "var(--cat-kubernetes)",
};

export const CATEGORY_ICON: Record<Category, string> = {
  Linux: "🐧",
  Docker: "🐳",
  Terraform: "🏗️",
  Network: "🌐",
  Security: "🛡️",
  Azure: "☁️",
  Kubernetes: "⚓",
};

export const STARTER_CARDS: CommandCard[] = [
  // Linux Basics
  {
    id: "linux-ls",
    command: "ls -lah",
    category: "Linux",
    deck: "Linux Basics",
    description: "List files with details, human-readable sizes, including hidden ones.",
    example: "ls -lah /var/log",
    whenToUse: "Inspect a directory's contents and permissions quickly.",
    difficulty: "Beginner",
    power: 35,
    quiz: {
      question: "Which flag shows hidden files in ls?",
      answer: "-a",
      explanation: "-a (all) lists files starting with a dot.",
    },
  },
  {
    id: "linux-grep",
    command: "grep -rni 'pattern' .",
    category: "Linux",
    deck: "Linux Basics",
    description: "Recursively search for a case-insensitive pattern with line numbers.",
    example: "grep -rni 'TODO' src/",
    whenToUse: "Find every place a string appears in a codebase.",
    difficulty: "Beginner",
    power: 55,
    quiz: {
      question: "What does -r do in grep?",
      answer: "Recursive search through directories",
      explanation: "-r walks subdirectories looking for matches.",
    },
  },
  {
    id: "linux-chmod",
    command: "chmod 755 file",
    category: "Linux",
    deck: "Linux Basics",
    description: "Set permissions: owner rwx, group rx, others rx.",
    example: "chmod 755 deploy.sh",
    whenToUse: "Make a script executable while keeping it safe for others.",
    difficulty: "Beginner",
    power: 50,
    quiz: {
      question: "What permission does 755 give the owner?",
      answer: "Read, write, execute (rwx)",
      explanation: "7 = 4+2+1 = rwx.",
    },
  },
  {
    id: "linux-ps",
    command: "ps aux | grep nginx",
    category: "Linux",
    deck: "Linux Basics",
    description: "List all running processes and filter to those matching 'nginx'.",
    example: "ps aux | grep python",
    whenToUse: "Check whether a service is running and find its PID.",
    difficulty: "Beginner",
    power: 45,
    quiz: {
      question: "What does the 'aux' in 'ps aux' include?",
      answer: "All users' processes with details",
      explanation: "a=all users, u=user-oriented, x=processes without a tty.",
    },
  },
  {
    id: "linux-tail",
    command: "tail -f /var/log/syslog",
    category: "Linux",
    deck: "Linux Basics",
    description: "Follow a log file in real time as new lines are appended.",
    example: "tail -f app.log",
    whenToUse: "Watch logs while reproducing a bug.",
    difficulty: "Beginner",
    power: 60,
    quiz: {
      question: "Which flag makes tail follow new log lines?",
      answer: "-f",
      explanation: "-f keeps the file open and prints new content as it arrives.",
    },
  },

  // Docker Basics
  {
    id: "docker-ps",
    command: "docker ps -a",
    category: "Docker",
    deck: "Docker Basics",
    description: "List all containers, including stopped ones.",
    example: "docker ps -a --format 'table {{.Names}}\\t{{.Status}}'",
    whenToUse: "See which containers exist and their status.",
    difficulty: "Beginner",
    power: 45,
    quiz: {
      question: "What does -a do in docker ps?",
      answer: "Shows all containers (including stopped)",
      explanation: "Without -a only running containers are shown.",
    },
  },
  {
    id: "docker-run",
    command: "docker run -d -p 8080:80 nginx",
    category: "Docker",
    deck: "Docker Basics",
    description: "Run nginx in detached mode and publish container port 80 to host 8080.",
    example: "docker run -d -p 5432:5432 postgres",
    whenToUse: "Spin up a service quickly for local testing.",
    difficulty: "Beginner",
    power: 65,
    quiz: {
      question: "What does -d mean in docker run?",
      answer: "Detached (runs in the background)",
      explanation: "Detached mode returns control to the shell.",
    },
  },
  {
    id: "docker-logs",
    command: "docker logs -f <container>",
    category: "Docker",
    deck: "Docker Basics",
    description: "Stream a container's stdout/stderr in real time.",
    example: "docker logs -f web",
    whenToUse: "Debug a misbehaving container.",
    difficulty: "Beginner",
    power: 55,
    quiz: {
      question: "How do you follow container logs continuously?",
      answer: "docker logs -f <container>",
      explanation: "-f follows the log output like tail -f.",
    },
  },
  {
    id: "docker-exec",
    command: "docker exec -it <container> bash",
    category: "Docker",
    deck: "Docker Basics",
    description: "Open an interactive shell inside a running container.",
    example: "docker exec -it db psql -U postgres",
    whenToUse: "Inspect a container's filesystem or run ad-hoc commands.",
    difficulty: "Intermediate",
    power: 70,
    quiz: {
      question: "What do -it flags do in docker exec?",
      answer: "Interactive TTY (keeps stdin open, allocates a terminal)",
      explanation: "Required for interactive shells.",
    },
  },
  {
    id: "docker-build",
    command: "docker build -t myapp:1.0 .",
    category: "Docker",
    deck: "Docker Basics",
    description: "Build an image from the Dockerfile in the current directory and tag it.",
    example: "docker build -t api:dev .",
    whenToUse: "Package application code into a deployable image.",
    difficulty: "Beginner",
    power: 60,
    quiz: {
      question: "What does -t do in docker build?",
      answer: "Tags the image with a name",
      explanation: "Format: name:tag.",
    },
  },

  // Terraform Basics
  {
    id: "tf-init",
    command: "terraform init",
    category: "Terraform",
    deck: "Terraform Basics",
    description: "Initialize a working directory and download provider plugins.",
    example: "terraform init -upgrade",
    whenToUse: "First step in any new Terraform project or after adding providers.",
    difficulty: "Beginner",
    power: 50,
    quiz: {
      question: "When must you run terraform init?",
      answer: "After cloning a project or changing providers/backends",
      explanation: "It downloads plugins and configures the backend.",
    },
  },
  {
    id: "tf-plan",
    command: "terraform plan -out=tfplan",
    category: "Terraform",
    deck: "Terraform Basics",
    description: "Preview infrastructure changes and save them to a plan file.",
    example: "terraform plan -var env=prod",
    whenToUse: "Review proposed changes before applying anything.",
    difficulty: "Beginner",
    power: 70,
    quiz: {
      question: "Why save the plan to a file?",
      answer: "To apply exactly what was previewed",
      explanation: "terraform apply tfplan guarantees no drift between plan and apply.",
    },
  },
  {
    id: "tf-apply",
    command: "terraform apply tfplan",
    category: "Terraform",
    deck: "Terraform Basics",
    description: "Apply the changes captured in a previously saved plan.",
    example: "terraform apply -auto-approve",
    whenToUse: "Provision or update infrastructure deterministically.",
    difficulty: "Intermediate",
    power: 80,
    quiz: {
      question: "What's safer: 'apply' or 'apply tfplan'?",
      answer: "apply tfplan",
      explanation: "It applies exactly what plan showed; no surprises.",
    },
  },
  {
    id: "tf-destroy",
    command: "terraform destroy",
    category: "Terraform",
    deck: "Terraform Basics",
    description: "Tear down everything managed by this Terraform state.",
    example: "terraform destroy -target=aws_instance.web",
    whenToUse: "Clean up a test environment to stop costs.",
    difficulty: "Intermediate",
    power: 85,
    quiz: {
      question: "How do you destroy just one resource?",
      answer: "Use -target=<resource>",
      explanation: "Targets the destroy to a single resource address.",
    },
  },
  {
    id: "tf-fmt",
    command: "terraform fmt -recursive",
    category: "Terraform",
    deck: "Terraform Basics",
    description: "Format Terraform code to canonical style, recursively.",
    example: "terraform fmt -check",
    whenToUse: "Keep your IaC clean in CI.",
    difficulty: "Beginner",
    power: 30,
    quiz: {
      question: "How do you check formatting without changing files?",
      answer: "terraform fmt -check",
      explanation: "Returns non-zero if any file is unformatted.",
    },
  },

  // Network Troubleshooting
  {
    id: "net-ping",
    command: "ping -c 4 example.com",
    category: "Network",
    deck: "Network Troubleshooting",
    description: "Send 4 ICMP echo requests to check reachability and latency.",
    example: "ping -c 4 8.8.8.8",
    whenToUse: "Confirm a host is online and measure round-trip time.",
    difficulty: "Beginner",
    power: 40,
    quiz: {
      question: "What does -c 4 limit?",
      answer: "The number of packets sent",
      explanation: "Without it, ping runs forever on Linux.",
    },
  },
  {
    id: "net-traceroute",
    command: "traceroute example.com",
    category: "Network",
    deck: "Network Troubleshooting",
    description: "Show every hop on the network path to a destination.",
    example: "traceroute -n 1.1.1.1",
    whenToUse: "Find where packets are dropping between you and a service.",
    difficulty: "Intermediate",
    power: 60,
    quiz: {
      question: "What does each line of traceroute output represent?",
      answer: "One router hop along the path",
      explanation: "Each TTL increment reveals the next router.",
    },
  },
  {
    id: "net-dig",
    command: "dig +short example.com",
    category: "Network",
    deck: "Network Troubleshooting",
    description: "Look up DNS records concisely.",
    example: "dig MX example.com +short",
    whenToUse: "Diagnose DNS resolution issues.",
    difficulty: "Intermediate",
    power: 65,
    quiz: {
      question: "How do you query the MX record for a domain?",
      answer: "dig MX <domain>",
      explanation: "Specify the record type before the domain.",
    },
  },
  {
    id: "net-ss",
    command: "ss -tlnp",
    category: "Network",
    deck: "Network Troubleshooting",
    description: "List TCP listening sockets and which process owns each port.",
    example: "ss -tlnp | grep 8080",
    whenToUse: "Find what's holding a port hostage.",
    difficulty: "Intermediate",
    power: 70,
    quiz: {
      question: "Which flag in ss shows the owning process?",
      answer: "-p",
      explanation: "-p adds the process name and PID column.",
    },
  },
  {
    id: "net-curl",
    command: "curl -I https://example.com",
    category: "Network",
    deck: "Network Troubleshooting",
    description: "Fetch only the response headers from a URL.",
    example: "curl -I https://api.github.com",
    whenToUse: "Check status codes, redirects, and headers quickly.",
    difficulty: "Beginner",
    power: 50,
    quiz: {
      question: "What does curl -I return?",
      answer: "Only the HTTP response headers",
      explanation: "-I issues a HEAD request.",
    },
  },

  // Security Commands
  {
    id: "sec-nmap",
    command: "nmap -sV target.com",
    category: "Security",
    deck: "Security Commands",
    description: "Scan a host and detect service versions on open ports.",
    example: "nmap -sV -p 1-1024 10.0.0.1",
    whenToUse: "Audit which services are exposed on a server.",
    difficulty: "Intermediate",
    power: 75,
    quiz: {
      question: "What does -sV add to a basic nmap scan?",
      answer: "Service/version detection",
      explanation: "Probes open ports to identify the running software.",
    },
  },
  {
    id: "sec-openssl",
    command: "openssl s_client -connect host:443",
    category: "Security",
    deck: "Security Commands",
    description: "Open a raw TLS connection to inspect a server's certificate.",
    example: "openssl s_client -connect example.com:443 -servername example.com",
    whenToUse: "Debug TLS handshakes and certificate chains.",
    difficulty: "Advanced",
    power: 85,
    quiz: {
      question: "Why pass -servername?",
      answer: "To send SNI so the right cert is returned",
      explanation: "Modern servers host many certs per IP and need SNI.",
    },
  },
  {
    id: "sec-ssh-keygen",
    command: "ssh-keygen -t ed25519 -C 'me@host'",
    category: "Security",
    deck: "Security Commands",
    description: "Generate a modern ed25519 SSH keypair with a comment.",
    example: "ssh-keygen -t ed25519 -f ~/.ssh/id_work",
    whenToUse: "Create a strong key for passwordless SSH or Git access.",
    difficulty: "Beginner",
    power: 60,
    quiz: {
      question: "Why prefer ed25519 over RSA?",
      answer: "Smaller keys, faster, modern security",
      explanation: "ed25519 offers strong security with much smaller keys.",
    },
  },
  {
    id: "sec-ufw",
    command: "ufw allow 22/tcp",
    category: "Security",
    deck: "Security Commands",
    description: "Open TCP port 22 (SSH) in the Uncomplicated Firewall.",
    example: "ufw enable && ufw allow 22/tcp",
    whenToUse: "Lock down a Linux server while keeping SSH access.",
    difficulty: "Beginner",
    power: 55,
    quiz: {
      question: "What is the default ufw policy after 'ufw enable'?",
      answer: "Deny incoming, allow outgoing",
      explanation: "Hence you must explicitly allow ports you need.",
    },
  },
  {
    id: "sec-fail2ban",
    command: "fail2ban-client status sshd",
    category: "Security",
    deck: "Security Commands",
    description: "Check which IPs Fail2Ban has banned for the SSH jail.",
    example: "fail2ban-client unban 1.2.3.4",
    whenToUse: "Audit or unban an IP after a lockout.",
    difficulty: "Intermediate",
    power: 65,
    quiz: {
      question: "What protects you when Fail2Ban detects brute-force SSH?",
      answer: "It bans the offending IP via iptables/nftables",
      explanation: "Bans expire after the configured ban time.",
    },
  },
];

// Battle scenarios for Battle Mode
export interface BattleScenario {
  id: string;
  scenario: string;
  correctCommand: string; // matches a card's `command`
  explanation: string;
  category: Category;
}

export const BATTLE_SCENARIOS: BattleScenario[] = [
  {
    id: "b1",
    scenario: "Your web app is down. You SSH in and need to know if nginx is running.",
    correctCommand: "ps aux | grep nginx",
    explanation: "ps aux lists every process; grep filters for nginx.",
    category: "Linux",
  },
  {
    id: "b2",
    scenario: "A user reports the site 'just hangs'. You want to watch live logs as they retry.",
    correctCommand: "tail -f /var/log/syslog",
    explanation: "tail -f streams new log lines as they're written.",
    category: "Linux",
  },
  {
    id: "b3",
    scenario: "Your container exited unexpectedly and you want to see its last output.",
    correctCommand: "docker logs -f <container>",
    explanation: "docker logs shows the container's stdout/stderr.",
    category: "Docker",
  },
  {
    id: "b4",
    scenario: "You need a quick interactive shell inside a running database container.",
    correctCommand: "docker exec -it <container> bash",
    explanation: "docker exec -it opens an interactive TTY in the container.",
    category: "Docker",
  },
  {
    id: "b5",
    scenario: "Before merging an IaC PR you want to see exactly what will change in AWS.",
    correctCommand: "terraform plan -out=tfplan",
    explanation: "terraform plan previews and saves the diff.",
    category: "Terraform",
  },
  {
    id: "b6",
    scenario: "Done with a sandbox environment — you want to stop paying for it.",
    correctCommand: "terraform destroy",
    explanation: "terraform destroy removes every managed resource.",
    category: "Terraform",
  },
  {
    id: "b7",
    scenario: "Users say a domain isn't resolving. You want to quickly check its DNS record.",
    correctCommand: "dig +short example.com",
    explanation: "dig is the go-to DNS diagnostic tool.",
    category: "Network",
  },
  {
    id: "b8",
    scenario: "You can't start your dev server — port 8080 is already in use. Find who has it.",
    correctCommand: "ss -tlnp",
    explanation: "ss -tlnp shows listening TCP sockets with PIDs.",
    category: "Network",
  },
  {
    id: "b9",
    scenario: "You want to audit which services a remote server exposes.",
    correctCommand: "nmap -sV target.com",
    explanation: "nmap -sV scans ports and identifies service versions.",
    category: "Security",
  },
  {
    id: "b10",
    scenario: "A new server is exposed to the internet — you want SSH open but everything else closed.",
    correctCommand: "ufw allow 22/tcp",
    explanation: "ufw with deny-by-default + allowing 22 is the standard hardening step.",
    category: "Security",
  },
];