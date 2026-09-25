export const profile = {
  name: "Arun Balakrishna Bhat",
  role: "Data Platform Engineer",
  summary: "I design, build, and operate Kafka-based data pipelines and CDC platforms, with a focus on reliability, performance, and data quality. I automate infrastructure and help engineering teams move from ingestion to dependable data consumption.",
  location: "Udupi, India",
  email: "arun.b.bhat@gmail.com",
  github: "https://github.com/arunherga",
  linkedin: "https://www.linkedin.com/in/arunbbhat/",
  leetcode: "https://leetcode.com/u/arunHerga/",
  resume: "/resume/Arun_Bhat_Resume_Data_Platform_Engineer.pdf",
};

// Resume-backed skills, plus tools Arun previously confirmed and his GitHub profile.
export const skillGroups = [
  {
    title: "Streaming & integration", id: "01",
    description: "Kafka Connect, CDC ingestion, connector tuning, Schema Registry, and workflow orchestration.",
    skills: [{ name: "Apache Kafka", icon: "/skills/apachekafka.svg" }, { name: "Confluent Platform", icon: "/skills/confluent.png" }, { name: "Confluent Cloud", icon: "/skills/confluent.png" }, { name: "Debezium CDC", icon: "/skills/debezium.svg" }, { name: "Strimzi", icon: "/skills/strimzi.svg" }, { name: "Temporal", icon: "/skills/temporal.svg" }],
  },
  {
    title: "Cloud & containers", id: "02",
    description: "Managed Kubernetes on EKS, Azure Event Hubs migrations, networking, storage, and production troubleshooting.",
    skills: [{ name: "Kubernetes", icon: "/skills/kubernetes.svg" }, { name: "AWS / EKS", icon: "/skills/amazonwebservices.svg" }, { name: "Azure / Event Hubs", icon: "/skills/azure.svg" }, { name: "Docker", icon: "/skills/docker.svg" }, { name: "Docker Compose", icon: "/skills/docker-compose.png" }, { name: "Linux", icon: "/skills/linux.svg" }],
  },
  {
    title: "Infrastructure & GitOps", id: "03",
    description: "Repeatable provisioning, GitOps deployments, configuration management, and controlled rolling upgrades.",
    skills: [{ name: "Terraform", icon: "/skills/terraform.svg" }, { name: "OpenTofu", icon: "/skills/opentofu.svg" }, { name: "Ansible", icon: "/skills/ansible.svg" }, { name: "Helm", icon: "/skills/helm.svg" }, { name: "Kustomize", icon: "/skills/kustomize.svg" }, { name: "Flux CD", icon: "/skills/flux.svg" }],
  },
  {
    title: "Code & data", id: "04",
    description: "Pipeline automation, operator tooling, shell scripts, and custom Java transforms for Kafka Connect.",
    skills: [{ name: "Python", icon: "/skills/python.svg" }, { name: "Go", icon: "/skills/go.svg" }, { name: "Bash / Shell", icon: "/skills/bash.svg" }, { name: "Java", icon: "/skills/java.svg" }, { name: "MySQL", icon: "/skills/mysql.svg" }, { name: "MS SQL Server", icon: "/skills/microsoftsqlserver.svg" }],
  },
  {
    title: "Observability & reliability", id: "05",
    description: "Connector health, data-freshness alerts, centralized logging, P1/P2 incident response, and root-cause analysis.",
    skills: [{ name: "Grafana", icon: "/skills/grafana.svg" }, { name: "OpenSearch", icon: "/skills/opensearch.svg" }, { name: "ELK Stack", icon: "/skills/elasticsearch.svg" }, { name: "PagerDuty", icon: "/skills/pagerduty.svg" }],
  },
];

export const experience = [
  {
    company: "iHerb", role: "Data Platform Engineer", period: "2025 — Present",
    summary: "Operate Confluent Kafka and Strimzi clusters on Kubernetes, and build Debezium CDC pipelines for production data platforms.",
    highlights: ["Improved CDC throughput by approximately 60% through connector and task tuning.", "Strengthened connector health and data-freshness monitoring; fixed a data-loss bug with a custom Java transform.", "Manage GitOps deployments with Helm, Kustomize, and Flux CD, alongside Confluent Cloud capacity and cost planning."],
  },
  {
    company: "Platformatory Labs", role: "Data Engineer / Lead SRE", period: "2022 — 2025",
    summary: "Built and operated streaming platforms for Jollibee Foods Corporation, Tata Digital, and MCX, spanning data integration, cloud migration, and SRE.",
    highlights: ["Collaborated with 40+ engineering teams on integrations for a centralized Kafka-based data hub.", "Contributed to an Azure Event Hubs to Confluent Cloud migration with zero data loss and over 50% cost optimization.", "Led six SREs supporting 24/7 Kafka operations, coordinating incident response, RCA, and Ansible-driven upgrades."],
  },
];

export const certifications = [
  { short: "CKA", name: "Certified Kubernetes Administrator", issuer: "The Linux Foundation", href: "https://www.credly.com/badges/91a94e2d-a6af-4ea6-8b78-d5bf4d597584" },
  { short: "AZ-900", name: "Microsoft Certified: Azure Fundamentals", issuer: "Microsoft", href: "https://learn.microsoft.com/en-us/users/arunbalakrishnabhat-2012/credentials/f2cd424cf6b1a573" },
  { short: "CCDAK", name: "Confluent Certified Developer for Apache Kafka", issuer: "Confluent", href: "https://www.credential.net/dad704fd-6219-467a-afec-2a17214ff24c" },
  { short: "DSE", name: "Data Streaming Engineer Foundations", issuer: "Confluent", href: "https://certificates.confluent.io/b69ad703-8c97-432f-ab12-7f4ceb86690a" },
];

export const projects = [
  { number: "01", name: "kgrep", category: "KAFKA TOOLING", description: "Search, watch, and export Kafka topic records without writing a one-off consumer. Inspect topics, understand consumer-group lag, and work with Schema Registry from the command line.", tags: ["Go", "Apache Kafka", "CLI", "Schema Registry"], href: "https://github.com/arunherga/kgrep", filename: "kgrep/", motif: "search → inspect → understand" },
  { number: "02", name: "confluent-terraform-mock", category: "INFRASTRUCTURE SANDBOX", description: "A local Confluent Cloud stand-in for running real Terraform plan, apply, and destroy workflows. Develop and test infrastructure changes in a local sandbox.", tags: ["Go", "Terraform", "Confluent Cloud"], href: "https://github.com/arunherga/confluent-terraform-mock", filename: "confluent-terraform-mock/", motif: "plan → apply → destroy" },
  { number: "03", name: "KafkaEndToEndLatency", category: "OBSERVABILITY", description: "A Kafka latency profiler that measures time between message timestamps and reports topic-wide and per-partition results to Kafka or CSV.", tags: ["Python", "Apache Kafka", "Latency"], href: "https://github.com/arunherga/KafkaEndToEndLatency", filename: "KafkaEndToEndLatency/", motif: "produce → consume → measure" },
  { number: "04", name: "plastic-recycling-intelligence", category: "DAILY INTELLIGENCE", description: "A Python agent that collects public news and government updates, removes duplicates, and ranks plastic-recycling developments by relevance. Publishes daily briefings with explainable scores and a focus on Karnataka’s Udupi–Mangaluru coastal belt.", tags: ["Python", "RSS", "GitHub Actions", "Automation"], href: "https://github.com/arunherga/plastic-recycling-intelligence", filename: "plastic-recycling-intelligence/", motif: "collect → rank → brief" },
];
