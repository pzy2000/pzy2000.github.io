---
permalink: /zh/
title: "彭志远（Zhiyuan Peng）"
seo_title: "彭志远（Zhiyuan Peng）| 大模型智能体与 Agentic Coding，上海交通大学"
description: "彭志远（Zhiyuan Peng），上海交通大学计算机学院博士研究生，研究方向为大模型智能体（Agent）、Agentic Coding 与多智能体系统，在 ACL、EMNLP、FSE、ASE 等国际顶级会议发表论文。"
excerpt: ""
author_profile: true
lang: zh-CN
---

<div class="language-switch" markdown="1">
[English](/){:target="_self"}
</div>

<span class='anchor' id='about-me'></span>

# 彭志远（Zhiyuan Peng）
{: .site-headline}

<div class="site-tagline">上海交通大学 计算机学院 · 博士研究生 · 大模型智能体与 Agentic Coding</div>

**彭志远（Lucius Peng）** 是[上海交通大学](https://www.sjtu.edu.cn/)计算机学院二年级博士研究生。我曾有幸在腾讯光子工作室群（青云计划）和微软亚洲研究院（MSRA）实习。我的研究兴趣包括*大模型智能体（Agent）、Agentic Coding、多智能体系统*。我的工作围绕能在真实执行环境中规划、调用工具并采取行动的 Agent 展开，从单个交付可运行仓库的 Coding Agent，到可治理的角色化 Agent 团队。我已在 **ACL**、**EMNLP**、**FSE**、**ASE** 等国际顶级会议发表多篇论文，并开发了一些有代表性的工作：
- [OpenHire](https://github.com/pzy2000/OpenHire)：多智能体编排平台
- [PlayCoder](https://conf.researchr.org/details/fse-2026/fse-2026-research-papers/4/PlayCoder-Making-LLM-Generated-GUI-Code-Playable)：面向可玩游戏代码的 GUI Agent
- [RepoGenesis](https://arxiv.org/abs/2601.13943)：从零到一构建代码仓库
- [SolEval](https://github.com/pzy2000/SolEval) 和 [PrefGen](https://github.com/pzy2000/PrefGen)：垂域代码生成

2026 年，我将主持或参与以下研究方向：
- **Agentic Coding**：能在真实执行环境中编写、运行并修复代码的 Agent
- **多智能体编排**：角色化 Agent 团队，及其工具、权限与工作区治理
- **自进化 Agent**：把执行轨迹沉淀为可复用 Skill 与长期记忆

# 💼 经历 {#experience}

<div style="margin-top:0.6em;">
  <div style="display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid #eee;">
    <div style="width:104px;flex-shrink:0;display:flex;justify-content:center;">
      <img src="/images/logo-tencent.svg" alt="Tencent" style="max-width:104px;max-height:26px;object-fit:contain;">
    </div>
    <div>
      <div style="font-weight:600;">腾讯 · 光子工作室群（青云计划）· 研究实习生</div>
      <div style="color:#666;font-size:0.92em;margin-top:3px;">构建可操作真实游戏客户端、以交互验证生成代码的 GUI Agent，产出 PlayCoder（<span style="color:red">CCF-A</span>）。</div>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid #eee;">
    <div style="width:104px;flex-shrink:0;display:flex;justify-content:center;">
      <img src="/images/logo-microsoft.svg" alt="Microsoft Research Asia" style="max-width:104px;max-height:30px;object-fit:contain;">
    </div>
    <div>
      <div style="font-weight:600;">微软亚洲研究院（MSRA）· 研究实习生</div>
      <div style="color:#666;font-size:0.92em;margin-top:3px;">构建从 README 到代码仓库生成基准（NL→Repo），产出 RepoGenesis（<span style="color:red">CCF-A, ACL</span>）。</div>
    </div>
  </div>
</div>

# 🤖 智能体系统 {#agent-systems}

- **OpenHire**（作者）[![Stars](https://img.shields.io/github/stars/pzy2000/OpenHire?style=flat&logo=github&label=stars&color=orange)](https://github.com/pzy2000/OpenHire) 
  数字员工编排平台。一个 control agent 负责拆解模糊目标，并分发给多个角色化的 worker agent，每个 agent 运行在独立的 Docker 容器中，拥有隔离的工作区与权限边界。可插拔的 worker adapter 支持任何以镜像形式打包的 agent（目前已支持 `openclaw`、`hermes`、`nanobot`）；平台可通过 CLI、OpenAI 兼容 API 或飞书等 IM 渠道接入，并提供 Admin 控制台查看会话、执行轨迹与运行时状态。治理闭环让系统持续变强：成功的运行会被沉淀为可复用 skill、case 包与统一的长期记忆，供后续任务复用。
- **SoulBanner 万魂幡.Skill**（作者）[![Stars](https://img.shields.io/github/stars/pzy2000/SoulBanner?style=flat&logo=github&label=stars&color=orange)](https://github.com/pzy2000/SoulBanner) 
  一个多人格 `.skill` monorepo，把稳定的表达风格与判断框架蒸馏为可调用、可组合的 agent skill 模块，提供覆盖 6 个分类的路由入口 skill 与统一编写模板，便于社区持续提 PR 扩充。该 skill 库已被 OpenHire 的 Skill Catalog 直接接入——我发布的 skill 就是我的 agent 实际调用的 skill。
- **RepoGenesis**（作者）[![Stars](https://img.shields.io/github/stars/pzy2000/RepoGenesis?style=flat&logo=github&label=stars&color=orange)](https://github.com/pzy2000/RepoGenesis) 
  端到端的基准：从一份 README 出发生成可部署的多语言 Web 微服务仓库，并在 Docker 沙箱中真实构建、启动并调用该服务以验证其可运行性，覆盖 11 个框架与 18 个应用领域。论文被 ACL 2026 Main 接收（录用论文前 15%）。
- **YimMenu**（贡献者）[![Stars](https://img.shields.io/github/stars/YimMenu/YimMenu?style=flat&logo=github&label=stars&color=orange)](https://github.com/YimMenu/YimMenu) 
  我实现了基于规则的 Auto Drive 模块：一个感知-决策-控制闭环，可沿道路导航至地图路径点，无目标时自主漫游，并支持控制冲突检测与人工接管让行，配合 HUD 展示其内部状态。已通过约 2,000 公里的长程游戏内驾驶验证。
<!-- - **MindSpore Contributor**（华为国产深度学习框架）- [项目链接](https://gitee.com/mindspore/models) -->

# 🛠 技术栈 {#agent-stack}

- **编排**：control agent 目标拆解、角色化路由、多智能体并行协作与交叉校验
- **执行**：容器化 worker 生命周期管理、单 agent 隔离工作区、权限边界、沙箱内构建-运行-验证闭环
- **工具与接口**：工具调用（tool use / function calling）、OpenAI 兼容 API、CLI 与 IM（飞书）渠道、GUI 交互
- **记忆与技能**：skill 抽取与复用、可复用 case 包、长期记忆合并及其 diff 与安全回滚
- **可观测性**：会话轨迹留存、执行链路审查、工作区与运行时检查

# 📝 论文发表 {#publications}

{% capture publications %}
- [RepoGenesis: Benchmarking End-to-End Microservice Generation from Readme to Repository.](https://arxiv.org/abs/2601.13943)<br>
  <span style="color: blue;">**Zhiyuan Peng**</span>, Xin Yin\#, Pu Zhao, Fangkai Yang, Lu Wang, Ran Jia, Xu Chen, Qingwei Lin, Saravan Rajmohan, Dongmei Zhang.<br>
  In *Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (ACL'26)*. (<span style="color:red">CCF-A</span>)<br>
  <span style="color:#666;font-size:0.92em;">从一份 README 出发交付可运行的多服务仓库，并在隔离沙箱中通过构建、启动与真实调用来验证。</span>
- [PlayCoder: Making LLM-Generated GUI Code Playable.](https://conf.researchr.org/details/fse-2026/fse-2026-research-papers/4/PlayCoder-Making-LLM-Generated-GUI-Code-Playable)<br>
  <span style="color: blue;">**Zhiyuan Peng**</span>, Wei Tao\#, Xin Yin, Chenhao Ying, Yuan Luo, Yiwen Guo.<br>
  In *Proceedings of the ACM Joint European Software Engineering Conference and Symposium on the Foundations of Software Engineering (ESEC/FSE'26)*. (<span style="color:red">CCF-A</span>)<br>
  <span style="color:#666;font-size:0.92em;">GUI Agent 像真实玩家一样操作生成的游戏，可玩性由与运行中程序的交互判定，而非静态代码检查。</span>
- [SolEval: Benchmarking Large Language Models for Repository-level Solidity Code Generation.](https://arxiv.org/pdf/2502.18793)<br>
  <span style="color: blue;">**Zhiyuan Peng**</span>, Xin Yin\#, Rui Qian, Peiqin Lin, Yongkang Liu, Chenhao Ying, Yuan Luo.<br> 
  In *Proceedings of the 2025 Conference on Empirical Methods in Natural Language Processing (EMNLP’25 Main)*. (<span style="color:red">TH-CPL-A</span>)<br>
  <span style="color:#666;font-size:0.92em;">仓库级生成需闭环经过编译与链上测试执行，模型必须先解决跨合约依赖，产出才可能真正跑起来。</span>
- [PrefGen: A Preference-Driven Methodology for Secure Yet Gas-Efficient Smart Contract Generation.](https://arxiv.org/abs/2506.03006)<br>
  <span style="color: blue;">**Zhiyuan Peng**</span>, Xin Yin\#, Zijie Zhou, Chenhao Ying, Chao Ni, Yuan Luo.<br>
  In *Proceedings of the 40th IEEE/ACM Automated Software Engineering Conference (ASE'25)*. (<span style="color:red">CCF-A</span>)<br>
  <span style="color:#666;font-size:0.92em;">偏好驱动的生成-反馈迭代，引导模型同时满足安全性与 Gas 效率这两个相互冲突的目标。</span>
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

# 🔥 最新动态 {#news}
- *2026.04*: &nbsp;🎉 一篇论文被 ACL 2026 接收！
- *2026.04*: &nbsp;🎉 一篇论文被 FSE 2026 接收！
- *2025.08*: &nbsp;🎉 一篇论文被 EMNLP 2025 Main 接收！
- *2025.08*: &nbsp;🎉 一篇论文被 ASE 2025 接收！

<!-- # 📝 预印本 {#preprints}

- [EvoClawBench: Can Agents Learn Reusable Skills from Their Own Runs?](https://arxiv.org/abs/2607.09711), <span style="color: blue;">**Zhiyuan Peng**</span>, Xin Yin, Chenhao Ying, Zhe Cui, Zixiang Ding, Zhenhua Liu, Jiang Wu, Yuan Luo, Arxiv. -->

<!-- - [RepoTransAgent: Multi-Agent LLM Framework for Repository-Aware Code Translation.](http://arxiv.org/pdf/2508.17720), Ziqi Guan, Xin Yin\#, <span style="color: blue;">**Zhiyuan Peng**</span>, Chao Ni, Arxiv. -->

# 🎖 荣誉奖励 {#honors}

- *2021.10* 全国大学生英语竞赛决赛一等奖

# 📖 教育经历 {#education}
- *2024.09 - 至今*，博士研究生，上海交通大学 计算机学院。
- *2022.09 - 2024.06*，硕士，南京大学。
- *2018.09 - 2022.06*，本科，河海大学。
