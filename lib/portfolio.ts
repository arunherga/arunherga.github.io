export const profile = {
  name: "Arun Balakrishna Bhat",
  role: "Platform Engineer",
  location: "Udupi, India",
  email: "arun.b.bhat@gmail.com",
  github: "https://github.com/arunherga",
  linkedin: "https://www.linkedin.com/in/arunbbhat/",
  leetcode: "https://leetcode.com/u/arunHerga/",
};

// Skills and credentials from the GitHub profile and verified credential links.
export const skillGroups = [
  { title: "Code & automation", id: "01", skills: [{ name: "Python", mark: "Py" }, { name: "Go", mark: "Go" }, { name: "Bash / Shell", mark: "$_" }] },
  { title: "Systems & containers", id: "02", skills: [{ name: "Linux", mark: "Lx" }, { name: "Docker", mark: "Dk" }, { name: "Docker Compose", mark: "Dc" }, { name: "Kubernetes", mark: "K8s" }] },
  { title: "Cloud & infrastructure", id: "03", skills: [{ name: "Terraform", mark: "Tf" }, { name: "AWS", mark: "AWS" }, { name: "Azure", mark: "Az" }] },
  { title: "Streaming & data", id: "04", skills: [{ name: "Apache Kafka", mark: "Kf" }, { name: "Temporal", mark: "Tm" }, { name: "MySQL", mark: "My" }, { name: "MS SQL Server", mark: "SQL" }] },
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
];
