export type CardType = "monster" | "spell";

export type Category =
  | "Linux"
  | "Docker"
  | "Database"
  | "Web"
  | "Network"
  | "Security"
  | "Terraform"
  | "Azure"
  | "Kubernetes";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface DualCard {
  id: string;
  name: string;
  type: CardType;
  category: Category;

  imageName?: string;
  level: number;
  attack: number;
  defense: number;

  description: string;

  command: string;
  code: string;
  explanation: string;

  difficulty: Difficulty;
  deck: string;

  fusionWith?: string[];
  creates?: string;

  quiz: {
    question: string;
    answer: string;
    explanation: string;
  };
}

export const dockerStarterCards: DualCard[] = [
  {
    id: "monster-docker-nginx",
    name: "Docker Web Monster",
    type: "monster",
    category: "Docker",
    imageName: "nginx:alpine",
    level: 4,
    attack: 1200,
    defense: 900,
    deck: "Docker Starter Lab",
    difficulty: "Beginner",

    description:
      "A basic Docker monster that runs an NGINX web server using the lightweight nginx:alpine image.",

    command: "docker run -d --name web-monster -p 8081:80 nginx:alpine",

    code: `# Run the Docker Web Monster
docker run -d --name web-monster -p 8081:80 nginx:alpine

# Check if it is running
docker ps

# Test it from your browser
http://localhost:8081

# Stop it
docker stop web-monster

# Remove it
docker rm web-monster`,

    explanation:
      "This card teaches how to run a simple web server container. The -d flag runs it in the background. --name gives the container a friendly name. -p 8081:80 maps port 8081 on your machine to port 80 inside the container. nginx:alpine is the Docker image.",

    fusionWith: ["monster-docker-postgres"],
    creates: "monster-fullstack-lab",

    quiz: {
      question: "What does -p 8081:80 mean?",
      answer: "It maps host port 8081 to container port 80.",
      explanation:
        "The left side is the host port. The right side is the container port.",
    },
  },
  {
    id: "monster-docker-postgres",
    name: "Docker Database Monster",
    type: "monster",
    category: "Database",
    imageName: "postgres:16-alpine",
    level: 4,
    attack: 1000,
    defense: 1400,
    deck: "Docker Starter Lab",
    difficulty: "Beginner",

    description:
      "A basic database monster that runs PostgreSQL inside Docker using a simple password and local volume.",

    command:
      "docker run -d --name db-monster -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=dualdb -p 5433:5432 -v dual_pgdata:/var/lib/postgresql/data postgres:16-alpine",

    code: `# Run the Docker Database Monster
docker run -d \\
  --name db-monster \\
  -e POSTGRES_PASSWORD=devpass \\
  -e POSTGRES_DB=dualdb \\
  -p 5433:5432 \\
  -v dual_pgdata:/var/lib/postgresql/data \\
  postgres:16-alpine

# Check running containers
docker ps

# Connect to PostgreSQL from inside the container
docker exec -it db-monster psql -U postgres -d dualdb

# Stop it
docker stop db-monster

# Remove it
docker rm db-monster

# Remove the volume only if you want to delete database data
docker volume rm dual_pgdata`,

    explanation:
      "This card teaches how to run a database container. Environment variables configure the database password and database name. The volume keeps database data even if the container is removed. Port 5433 on the host maps to PostgreSQL port 5432 inside the container.",

    fusionWith: ["monster-docker-nginx"],
    creates: "monster-fullstack-lab",

    quiz: {
      question: "Why do we use a Docker volume for PostgreSQL?",
      answer: "To keep database data after the container is removed.",
      explanation:
        "Without a volume, the database files are stored inside the container and may be lost when the container is deleted.",
    },
  },
  {
    id: "spell-docker-compose-fusion",
    name: "Docker Compose Fusion",
    type: "spell",
    category: "Docker",
    level: 4,
    attack: 0,
    defense: 0,
    deck: "Docker Starter Lab",
    difficulty: "Beginner",

    description:
      "A spell card that fuses Docker Web Monster and Docker Database Monster into one working multi-container environment.",

    command: "docker compose up -d",

    code: `# docker-compose.yml
services:
  web:
    image: nginx:alpine
    container_name: web-monster
    ports:
      - "8081:80"
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    container_name: db-monster
    environment:
      POSTGRES_PASSWORD: devpass
      POSTGRES_DB: dualdb
    ports:
      - "5433:5432"
    volumes:
      - dual_pgdata:/var/lib/postgresql/data

volumes:
  dual_pgdata:

# Start both monsters
docker compose up -d

# Check status
docker compose ps

# Stop the environment
docker compose down

# Stop and delete database volume
docker compose down -v`,

    explanation:
      "Docker Compose lets you define multiple containers in one YAML file. Here, the web service uses nginx:alpine and the db service uses postgres:16-alpine. The depends_on setting starts the database before the web service. This creates your first Dual environment.",

    fusionWith: ["monster-docker-nginx", "monster-docker-postgres"],
    creates: "monster-fullstack-lab",

    quiz: {
      question: "What command starts all services in docker-compose.yml?",
      answer: "docker compose up -d",
      explanation:
        "docker compose up creates and starts the services. The -d flag runs them in the background.",
    },
  },
  {
    id: "monster-fullstack-lab",
    name: "Full Stack Lab Monster",
    type: "monster",
    category: "Docker",
    imageName: "nginx:alpine + postgres:16-alpine",
    level: 6,
    attack: 1700,
    defense: 1850,
    deck: "Docker Starter Lab",
    difficulty: "Intermediate",

    description:
      "A fused monster created from a web container and a database container. It represents a basic full-stack Docker environment.",

    command: "docker compose up -d",

    code: `services:
  web:
    image: nginx:alpine
    container_name: web-monster
    ports:
      - "8081:80"
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    container_name: db-monster
    environment:
      POSTGRES_PASSWORD: devpass
      POSTGRES_DB: dualdb
    ports:
      - "5433:5432"
    volumes:
      - dual_pgdata:/var/lib/postgresql/data

volumes:
  dual_pgdata:`,

    explanation:
      "This fused card represents your first working Docker environment: one web container and one database container controlled together with Docker Compose.",

    quiz: {
      question: "What two services are combined in this fused card?",
      answer: "NGINX web server and PostgreSQL database.",
      explanation:
        "The web service provides HTTP content. The database service stores application data.",
    },
  },
];

export const starterVisibleCards = dockerStarterCards.filter(
  (card) => card.id !== "monster-fullstack-lab"
);

export const fullStackLabMonster = dockerStarterCards.find(
  (card) => card.id === "monster-fullstack-lab"
);
