---
permalink: /zh/
title: ""
excerpt: ""
author_profile: true
lang: zh-CN
---

<div class="language-switch" markdown="1">
[English](/){:target="_self"}
</div>

<span class='anchor' id='about-me'></span>

**彭志远（Lucius Peng）** 是[上海交通大学](https://www.sjtu.edu.cn/)二年级博士研究生。我曾有幸在腾讯光子工作室群（青云计划）和微软亚洲研究院（MSRA）实习。我的研究兴趣包括*代码智能、大语言模型、软件测试*。我已在 **ACL**、**EMNLP**、**FSE**、**ASE** 等国际顶级会议发表多篇论文，并开发了一些有代表性的工作：
- [PlayCoder](https://conf.researchr.org/details/fse-2026/fse-2026-research-papers/4/PlayCoder-Making-LLM-Generated-GUI-Code-Playable)：游戏代码生成
- [RepoGenesis](https://arxiv.org/abs/2601.13943)：从零到一的代码仓库生成
- [SolEval](https://github.com/pzy2000/SolEval) 和 [PrefGen](https://github.com/pzy2000/PrefGen)：Solidity 代码生成

2026 年，我将主持或参与以下研究方向：
- 代码智能：代码大模型 & 智能体

# 💼 经历 {#experience}

<div style="margin-top:0.6em;">
  <div style="display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid #eee;">
    <div style="width:104px;flex-shrink:0;display:flex;justify-content:center;">
      <img src="/images/logo-tencent.svg" alt="Tencent" style="max-width:104px;max-height:26px;object-fit:contain;">
    </div>
    <div>
      <div style="font-weight:600;">腾讯 · 光子工作室群（青云计划）· 研究实习生</div>
      <div style="color:#666;font-size:0.92em;margin-top:3px;">围绕GUI Agent与游戏AI开展研究，产出 PlayCoder（<span style="color:red">CCF-A</span>）。</div>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid #eee;">
    <div style="width:104px;flex-shrink:0;display:flex;justify-content:center;">
      <img src="/images/logo-microsoft.svg" alt="Microsoft Research Asia" style="max-width:104px;max-height:30px;object-fit:contain;">
    </div>
    <div>
      <div style="font-weight:600;">微软亚洲研究院（MSRA）· 研究实习生</div>
      <div style="color:#666;font-size:0.92em;margin-top:3px;">围绕端到端代码仓库生成开展研究，产出 RepoGenesis（<span style="color:red">CCF-A, ACL</span>）。</div>
    </div>
  </div>
</div>

# 🔥 最新动态 {#news}
- *2026.04*: &nbsp;🎉 一篇论文被 ACL 2026 接收！
- *2026.04*: &nbsp;🎉 一篇论文被 FSE 2026 接收！
- *2025.08*: &nbsp;🎉 一篇论文被 EMNLP 2025 Main 接收！
- *2025.08*: &nbsp;🎉 一篇论文被 ASE 2025 接收！

# 📝 论文发表 {#publications}

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
{% capture representative %}{% if n_ccfa > 0 %}<span style="color:red">{{ n_ccfa }}</span> 篇 <span style="color:blue">CCF-A</span>|||{% endif %}{% if n_thcpl > 0 %}<span style="color:red">{{ n_thcpl }}</span> 篇 <span style="color:blue">TH-CPL-A</span>|||{% endif %}{% if n_jcrq1 > 0 %}<span style="color:red">{{ n_jcrq1 }}</span> 篇 <span style="color:blue">JCR-Q1</span>|||{% endif %}{% endcapture %}
{% assign representative = representative | split: '|||' | join: '、' %}

<span style="color:blue">代表性论文：</span>{{ representative }}

{{ publications | markdownify }}

**\# 表示共同第一作者**

# ✨ 项目经历 {#projects}

- **YimMenu**（贡献者）[![Stars](https://img.shields.io/github/stars/YimMenu/YimMenu?style=flat&logo=github&label=stars&color=orange)](https://github.com/YimMenu/YimMenu) 
  我为 YimMenu 开发了 Auto Drive 功能。该功能可沿道路跟随地图路径点导航，无路径点时进行漫游，并支持手动输入接管、控制检测与 HUD 状态展示。功能已通过约 2,000 公里的游戏内实车验证。
- **SoulBanner 万魂幡.Skill**（作者）[![Stars](https://img.shields.io/github/stars/pzy2000/SoulBanner?style=flat&logo=github&label=stars&color=orange)](https://github.com/pzy2000/SoulBanner) 
  一个多人格 `.skill` monorepo，把公开人物稳定的表达风格与判断框架蒸馏成可调用的 agent skill 模块。仓库提供总入口 skill、6 个分类页，以及统一模板与 research 六件套，便于社区持续提 PR 扩充角色。
- **RepoGenesis**（作者）[![Stars](https://img.shields.io/github/stars/pzy2000/RepoGenesis?style=flat&logo=github&label=stars&color=orange)](https://github.com/pzy2000/RepoGenesis) 
  首个面向仓库级端到端 Web 微服务生成的多语言 benchmark，覆盖 11 个框架与 18 个应用领域，提供 Pass@1、API Coverage、Deployment Success Rate 三项指标、基于 Docker 的隔离评测 harness 以及公开 leaderboard。论文被 ACL 2026 Main 接收（录用论文前 15%）。
<!-- - **MindSpore Contributor**（华为国产深度学习框架）- [项目链接](https://gitee.com/mindspore/models) -->

<!-- # 📝 预印本 {#preprints}

- [EvoClawBench: Can Agents Learn Reusable Skills from Their Own Runs?](https://arxiv.org/abs/2607.09711), <span style="color: blue;">**Zhiyuan Peng**</span>, Xin Yin, Chenhao Ying, Zhe Cui, Zixiang Ding, Zhenhua Liu, Jiang Wu, Yuan Luo, Arxiv. -->

<!-- - [RepoTransAgent: Multi-Agent LLM Framework for Repository-Aware Code Translation.](http://arxiv.org/pdf/2508.17720), Ziqi Guan, Xin Yin\#, <span style="color: blue;">**Zhiyuan Peng**</span>, Chao Ni, Arxiv. -->

# 🎖 荣誉奖励 {#honors}

- *2021.10* 全国大学生英语竞赛决赛一等奖

# 📖 教育经历 {#education}
- *2024.09 - 至今*，博士研究生，上海交通大学。
- *2022.09 - 2024.06*，硕士，南京大学。
- *2018.09 - 2022.06*，本科，河海大学。
