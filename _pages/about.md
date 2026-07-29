---
permalink: /
title: ""
excerpt: ""
author_profile: true
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

**Zhiyuan Peng (Lucius Peng)** is the 2nd-year Ph.D. student at [Shanghai Jiao Tong University](https://en.sjtu.edu.cn/). I was grateful to intern at Tencent LIGHTSPEED Studios and MSRA. My research interest includes *Code Generation, Large Language Model, and Software Testing*. I have published serveral papers at the top international conferences such as **ACL**, **EMNLP**, **FSE**, and **ASE**. I developed a few well-known approaches including:
- [PlayCoder](https://conf.researchr.org/details/fse-2026/fse-2026-research-papers/4/PlayCoder-Making-LLM-Generated-GUI-Code-Playable): Game Code Generation
- [RepoGenesis](https://arxiv.org/abs/2601.13943): Zero2One Code Generation
- [SolEval](https://github.com/pzy2000/SolEval) and [PrefGen](https://github.com/pzy2000/PrefGen): Solidity Code Generation

In 2026, I will lead or participate in the following research topics:
- Code Generation: Coding Model & Agent

# 💼 Experience {#experience}

<div style="margin-top:0.6em;">
  <div style="display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid #eee;">
    <div style="width:104px;flex-shrink:0;display:flex;justify-content:center;">
      <img src="/images/logo-tencent.svg" alt="Tencent" style="max-width:104px;max-height:26px;object-fit:contain;">
    </div>
    <div>
      <div style="font-weight:600;">Tencent &middot; LIGHTSPEED Studios (Qingyun Program) &middot; Research Intern</div>
      <div style="color:#666;font-size:0.92em;margin-top:3px;">Research on GUI Agent and game AI, producing PlayCoder (<span style="color:red">CCF-A</span>).</div>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid #eee;">
    <div style="width:104px;flex-shrink:0;display:flex;justify-content:center;">
      <img src="/images/logo-microsoft.svg" alt="Microsoft Research Asia" style="max-width:104px;max-height:30px;object-fit:contain;">
    </div>
    <div>
      <div style="font-weight:600;">Microsoft Research Asia (MSRA) &middot; Research Intern</div>
      <div style="color:#666;font-size:0.92em;margin-top:3px;">Research on end-to-end code repository generation, producing RepoGenesis (<span style="color:red">CCF-A, ACL</span>).</div>
    </div>
  </div>
</div>

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

# 📝 Publications

{% capture publications %}
- [RepoGenesis: Benchmarking End-to-End Microservice Generation from Readme to Repository.](https://arxiv.org/abs/2601.13943)<br>
  <span style="color: blue;">**Zhiyuan Peng**</span>, Xin Yin\#, Pu Zhao, Fangkai Yang, Lu Wang, Ran Jia, Xu Chen, Qingwei Lin, Saravan Rajmohan, Dongmei Zhang.<br>
  In *Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (ACL'26)*. (<span style="color:red">CCF-A</span>)
- [PlayCoder: Making LLM-Generated GUI Code Playable.](https://conf.researchr.org/details/fse-2026/fse-2026-research-papers/4/PlayCoder-Making-LLM-Generated-GUI-Code-Playable)<br>
  <span style="color: blue;">**Zhiyuan Peng**</span>, Wei Tao\#, Xin Yin, Chenhao Ying, Yuan Luo, Yiwen Guo.<br>
  In *Proceedings of the ACM Joint European Software Engineering Conference and Symposium on the Foundations of Software Engineering (ESEC/FSE'26)*. (<span style="color:red">CCF-A</span>)
- [SolEval: Benchmarking Large Language Models for Repository-level Solidity Smart Contract Generation.](https://arxiv.org/pdf/2502.18793)<br>
  <span style="color: blue;">**Zhiyuan Peng**</span>, Xin Yin\#, Rui Qian, Peiqin Lin, Yongkang Liu, Chenhao Ying, Yuan Luo.<br> 
  In *Proceedings of the 2025 Conference on Empirical Methods in Natural Language Processing (EMNLP’25 Main)*. (<span style="color:red">TH-CPL-A</span>)
- [PrefGen: A Preference-Driven Methodology for Secure Yet Gas-Efficient Smart Contract Generation.](https://arxiv.org/abs/2506.03006)<br>
  <span style="color: blue;">**Zhiyuan Peng**</span>, Xin Yin\#, Zijie Zhou, Chenhao Ying, Chao Ni, Yuan Luo.<br>
  In *Proceedings of the 40th IEEE/ACM Automated Software Engineering Conference (ASE'25)*. (<span style="color:red">CCF-A</span>)
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

# ✨ Projects

- **YimMenu** (Contributor) [![Stars](https://img.shields.io/github/stars/YimMenu/YimMenu?style=flat&logo=github&label=stars&color=orange)](https://github.com/YimMenu/YimMenu) 
  I developed the Auto Drive feature for YimMenu. It navigates along roads to the map waypoint, or wanders when none is set, with manual input takeover, control checks, and HUD telemetry. The feature has been validated with in-game driving tests covering about 2,000 km.
- **SoulBanner** (Author) [![Stars](https://img.shields.io/github/stars/pzy2000/SoulBanner?style=flat&logo=github&label=stars&color=orange)](https://github.com/pzy2000/SoulBanner) 
  A multi-persona `.skill` monorepo that distills the stable expression styles and judgment frameworks of public figures into callable agent skill modules. It ships an all-personas entry skill, 6 category pages, and a template plus six-part research structure so the community can keep adding personas via PRs.
- **RepoGenesis** (Author) [![Stars](https://img.shields.io/github/stars/pzy2000/RepoGenesis?style=flat&logo=github&label=stars&color=orange)](https://github.com/pzy2000/RepoGenesis) 
  The first multilingual benchmark for repository-level end-to-end web microservice generation, covering 11 frameworks and 18 application domains. It provides three metrics (Pass@1, API Coverage, Deployment Success Rate), a Docker-based isolated evaluation harness, and a public leaderboard. Accepted by ACL 2026 Main (top 15% of accepted papers).
<!-- - **MindSpore Contributor** (Huawei's domestic deep learning framework) - [Project Link](https://gitee.com/mindspore/models)   -->

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
- *2024.09 - Present*, Ph.D. student, Shanghai Jiao Tong University.
- *2022.09 - 2024.06*, Master, Nanjing University.
- *2018.09 - 2022.06*, Bachelor, Hohai University.
