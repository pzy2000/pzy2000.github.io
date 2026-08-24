---
permalink: /
title: "Zhiyuan Peng（彭志远）"
seo_title: "Zhiyuan Peng（彭志远）| LLM Agents & Agentic Coding, Shanghai Jiao Tong University"
description: "Zhiyuan Peng (彭志远), Ph.D. student at the School of Computer Science, Shanghai Jiao Tong University, building LLM agents for agentic coding and multi-agent systems."
excerpt: ""
author_profile: true
lang: en
redirect_from: 
  - /about/
  - /about.html
---

<div class="language-switch" markdown="1">
[中文](/zh/){:target="_self"}
</div>

{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "https://cdn.jsdelivr.net/gh/" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "https://raw.githubusercontent.com/" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

<span class='anchor' id='about-me'></span>

# Zhiyuan Peng（彭志远）
{: .site-headline}

<div class="site-tagline">Ph.D. Student, School of Computer Science, Shanghai Jiao Tong University &middot; LLM Agents &amp; Agentic Coding</div>

**Zhiyuan Peng (Lucius Peng)** is the 2nd-year Ph.D. student at the School of Computer Science, [Shanghai Jiao Tong University](https://en.sjtu.edu.cn/). I was grateful to intern at Tencent LIGHTSPEED Studios and MSRA. My research interest includes *LLM Agents, Agentic Coding, and Multi-Agent Systems*. I build agents that plan, call tools, and act inside real execution environments, from a single coding agent that ships a runnable repository to a governed fleet of role-based agents. I have published several papers at the top international conferences such as **ACL**, **EMNLP**, **FSE**, and **ASE**. I developed a few well-known approaches including:
- [OpenHire](https://github.com/pzy2000/OpenHire): Multi-Agent Orchestration Platform
- [PlayCoder](https://conf.researchr.org/details/fse-2026/fse-2026-research-papers/4/PlayCoder-Making-LLM-Generated-GUI-Code-Playable): GUI Agent for Playable Game Code
- [RepoGenesis](https://arxiv.org/abs/2601.13943): Zero-to-One Repository-Building
- [SolEval](https://github.com/pzy2000/SolEval) and [PrefGen](https://github.com/pzy2000/PrefGen): Domain-Specific Code Generation

In 2026, I will lead or participate in the following research topics:
- **Agentic Coding**: agents that write, run, and repair code in real execution environments
- **Multi-Agent Orchestration**: role-based agent teams with tool, permission, and workspace governance
- **Self-Evolving Agents**: distilling execution traces into reusable skills and long-term memory

# 💼 Experience {#experience}

<div style="margin-top:0.6em;">
  <div style="display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid #eee;">
    <div style="width:104px;flex-shrink:0;display:flex;justify-content:center;">
      <img src="/images/logo-tencent.svg" alt="Tencent" style="max-width:104px;max-height:26px;object-fit:contain;">
    </div>
    <div>
      <div style="font-weight:600;">Tencent &middot; LIGHTSPEED Studios (Qingyun Program) &middot; Research Intern</div>
      <div style="color:#666;font-size:0.92em;margin-top:3px;">Built GUI agents that drive live game clients to verify generated code, producing PlayCoder (<span style="color:red">CCF-A</span>).</div>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid #eee;">
    <div style="width:104px;flex-shrink:0;display:flex;justify-content:center;">
      <img src="/images/logo-microsoft.svg" alt="Microsoft Research Asia" style="max-width:104px;max-height:30px;object-fit:contain;">
    </div>
    <div>
      <div style="font-weight:600;">Microsoft Research Asia (MSRA) &middot; Research Intern</div>
      <div style="color:#666;font-size:0.92em;margin-top:3px;">Built a benchmark that takes a repository from README to a deployed, sandbox-verified service, producing RepoGenesis (<span style="color:red">CCF-A, ACL</span>).</div>
    </div>
  </div>
</div>

# 🤖 Agent Systems {#agent-systems}

- **OpenHire** (Author) [![Stars](https://img.shields.io/github/stars/pzy2000/OpenHire?style=flat&logo=github&label=stars&color=orange)](https://github.com/pzy2000/OpenHire) 
  A digital-employee orchestration platform. One control agent decomposes a fuzzy goal and fans it out to multiple role-based worker agents, each running in its own Docker container with an isolated workspace and permission scope. A pluggable worker adapter admits any image-packaged agent (`openclaw`, `hermes`, and `nanobot` are supported today), and the platform is reachable via CLI, an OpenAI-compatible API, or IM channels such as Feishu, with an Admin console for sessions, transcripts, and runtime state. A governance loop closes the system: successful runs are distilled into reusable skills, case packages, and consolidated long-term memory, so the next run starts stronger.
- **SoulBanner** (Author) [![Stars](https://img.shields.io/github/stars/pzy2000/SoulBanner?style=flat&logo=github&label=stars&color=orange)](https://github.com/pzy2000/SoulBanner) 
  A multi-persona `.skill` monorepo that distills stable expression styles and judgment frameworks into callable, composable agent skill modules, shipped with a router entry skill over 6 categories and a unified authoring template so the community can extend it via PRs. The catalog is consumed directly by OpenHire's Skill Catalog, so the skills I publish are the skills my agents run.
- **RepoGenesis** (Author) [![Stars](https://img.shields.io/github/stars/pzy2000/RepoGenesis?style=flat&logo=github&label=stars&color=orange)](https://github.com/pzy2000/RepoGenesis) 
  A benchmark that turns a README into a deployable multi-language web microservice repository, and then proves it by building, launching, and calling the service inside a Docker sandbox. Covers 11 frameworks and 18 application domains. Accepted by ACL 2026 Main (top 15% of accepted papers).
- **YimMenu** (Contributor) [![Stars](https://img.shields.io/github/stars/YimMenu/YimMenu?style=flat&logo=github&label=stars&color=orange)](https://github.com/YimMenu/YimMenu) 
  I built the Auto Drive agent: a perception-decision-control loop that navigates along roads to a map waypoint, roams autonomously when no goal is set, detects control conflicts, and yields on manual takeover, with HUD telemetry for its internal state. Validated across roughly 2,000 km of long-horizon in-game driving.
<!-- - **MindSpore Contributor** (Huawei's domestic deep learning framework) - [Project Link](https://gitee.com/mindspore/models)   -->

# 🛠 Agent Stack {#agent-stack}

- **Orchestration**: goal decomposition by a control agent, role-based routing, parallel multi-agent collaboration and cross-checking
- **Execution**: containerized worker lifecycle, per-agent isolated workspaces, permission scoping, sandboxed build-run-verify loops
- **Tools & Interfaces**: tool use / function calling, OpenAI-compatible API, CLI and IM (Feishu) channels, GUI interaction
- **Memory & Skills**: skill extraction and reuse, reusable case packages, long-term memory consolidation with diffs and safe rollback
- **Observability**: session transcripts, trace review, workspace and runtime inspection

# 📝 Publications

{% capture publications %}
- [RepoGenesis: Benchmarking End-to-End Microservice Generation from Readme to Repository.](https://arxiv.org/abs/2601.13943)<br>
  <span style="color: blue;">**Zhiyuan Peng**</span>, Xin Yin\#, Pu Zhao, Fangkai Yang, Lu Wang, Ran Jia, Xu Chen, Qingwei Lin, Saravan Rajmohan, Dongmei Zhang.<br>
  In *Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (ACL'26)*. (<span style="color:red">CCF-A</span>)<br>
  <span style="color:#666;font-size:0.92em;">An agent reads a README and delivers a runnable multi-service repository, verified by building, launching, and calling the service inside an isolated sandbox.</span>
- [PlayCoder: Making LLM-Generated GUI Code Playable.](https://conf.researchr.org/details/fse-2026/fse-2026-research-papers/4/PlayCoder-Making-LLM-Generated-GUI-Code-Playable)<br>
  <span style="color: blue;">**Zhiyuan Peng**</span>, Wei Tao\#, Xin Yin, Chenhao Ying, Yuan Luo, Yiwen Guo.<br>
  In *Proceedings of the ACM Joint European Software Engineering Conference and Symposium on the Foundations of Software Engineering (ESEC/FSE'26)*. (<span style="color:red">CCF-A</span>)<br>
  <span style="color:#666;font-size:0.92em;">A GUI agent plays the generated game the way a user would, so playability is judged by interacting with the live program instead of by inspecting static code.</span>
- [SolEval: Benchmarking Large Language Models for Repository-level Solidity Smart Contract Generation.](https://arxiv.org/pdf/2502.18793)<br>
  <span style="color: blue;">**Zhiyuan Peng**</span>, Xin Yin\#, Rui Qian, Peiqin Lin, Yongkang Liu, Chenhao Ying, Yuan Luo.<br> 
  In *Proceedings of the 2025 Conference on Empirical Methods in Natural Language Processing (EMNLP’25 Main)*. (<span style="color:red">TH-CPL-A</span>)<br>
  <span style="color:#666;font-size:0.92em;">Repository-level generation with compilation and on-chain test execution in the loop, forcing the model to resolve cross-contract dependencies before its output can run.</span>
- [PrefGen: A Preference-Driven Methodology for Secure Yet Gas-Efficient Smart Contract Generation.](https://arxiv.org/abs/2506.03006)<br>
  <span style="color: blue;">**Zhiyuan Peng**</span>, Xin Yin\#, Zijie Zhou, Chenhao Ying, Chao Ni, Yuan Luo.<br>
  In *Proceedings of the 40th IEEE/ACM Automated Software Engineering Conference (ASE'25)*. (<span style="color:red">CCF-A</span>)<br>
  <span style="color:#666;font-size:0.92em;">A preference-driven generate-and-feedback loop that steers the model toward code satisfying two competing objectives at once: security and gas efficiency.</span>
{% comment %}
- [A Preference-Driven Methodology for Efficient Code Generation.](https://ieeexplore.ieee.org/document/11273185)<br>
  Yuqi Li, Zijie Zhou, <span style="color: blue;">**Zhiyuan Peng**</span>, Junhao Dong, Haochen You, Renye Yan.<br>
  *IEEE Transactions on Artificial Intelligence*. (<span style="color:red">JCR-Q1</span>)
{% endcomment %}
{% endcapture %}
{% assign n_ccfa = publications | split: '>CCF-A<' | size | minus: 1 %}
{% assign n_thcpl = publications | split: '>TH-CPL-A<' | size | minus: 1 %}
{% assign n_jcrq1 = publications | split: '>JCR-Q1<' | size | minus: 1 %}
{% capture representative %}{% if n_ccfa > 0 %}<span style="color:red">{{ n_ccfa }}</span> <span style="color:blue">CCF-A papers</span>|||{% endif %}{% if n_thcpl > 0 %}<span style="color:red">{{ n_thcpl }}</span> <span style="color:blue">TH-CPL-A papers</span>|||{% endif %}{% if n_jcrq1 > 0 %}<span style="color:red">{{ n_jcrq1 }}</span> <span style="color:blue">JCR-Q1 papers</span>|||{% endif %}{% endcapture %}
{% assign representative = representative | split: '|||' | join: ', ' %}

<span style="color:blue">Representative papers:</span> {{ representative }}

{{ publications | markdownify }}

**\# denotes co-first author**

# 🔥 News
- *2026.04*: &nbsp;🎉 One paper was accepted by ACL 2026!
- *2026.04*: &nbsp;🎉 One paper was accepted by FSE 2026!
- *2025.08*: &nbsp;🎉 One paper was accepted by EMNLP 2025 Main!
- *2025.08*: &nbsp;🎉 One paper was accepted by ASE 2025!

<!-- - *2025.02*: &nbsp;🎉 One paper was accepted by CVPR 2025! -->
<!-- - *2024.09*: &nbsp;🎉 One paper was accepted by APSEC 2024! -->
<!-- - *2024.10*: &nbsp;🎉 One paper was accepted by ICSE 2025! -->
<!-- - *2024.09*: &nbsp;🎉 One paper was accepted by TPAMI 2024! -->
<!-- - *2024.09*: &nbsp;🎉 One paper was accepted by TSE 2024! -->
<!-- - *2024.07*: &nbsp;🎉 One paper was accepted by ISSTA 2024! -->
<!-- - *2023.05*: &nbsp;🎉 One paper was accepted by FSE 2023!  -->
<!-- - *2023.03*: &nbsp;🎉 One paper was accepted by ICPC 2023! -->
<!-- - *2022.11*: &nbsp;🎉 One paper was accepted by ISPA 2022! -->

# 💬 Academic Services
- Journal Reviewer: IEEE Transactions on Software Engineering (TSE), ACM Transactions on Software Engineering and Methodology (TOSEM), Automated Software Engineering (ASE)
- Conference Reviewer: NeurIPS 2026

<!-- # 📝 Preprints

- [EvoClawBench: Can Agents Learn Reusable Skills from Their Own Runs?](https://arxiv.org/abs/2607.09711), <span style="color: blue;">**Zhiyuan Peng**</span>, Xin Yin, Chenhao Ying, Zhe Cui, Zixiang Ding, Zhenhua Liu, Jiang Wu, Yuan Luo, Arxiv. -->

<!-- - [MulChain: Enabling Advanced Cross-Modal Queries in Hybrid-Storage Blockchains](https://arxiv.org/pdf/2502.18258), <span style="color: blue;">**Zhiyuan Peng**</span>, Xin Yin\#, Gang Wang, Chenhao Ying, Wei Chen, Xikun Jiang, Yibin Xu, Yuan Luo, Arxiv. -->

<!-- - [RepoTransAgent: Multi-Agent LLM Framework for Repository-Aware Code Translation.](http://arxiv.org/pdf/2508.17720), Ziqi Guan, Xin Yin\#, <span style="color: blue;">**Zhiyuan Peng**</span>, Chao Ni, Arxiv. -->


# 🎖 Honors and Awards

- *2021.10* First Prize in the National College Student English Competition Final


# 📖 Educations
- *2024.09 - Present*, Ph.D. student, School of Computer Science, Shanghai Jiao Tong University.
- *2022.09 - 2024.06*, Master, Nanjing University.
- *2018.09 - 2022.06*, Bachelor, Hohai University.
