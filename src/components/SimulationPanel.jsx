import React, { useState, useRef, useEffect } from 'react';
import { SCENARIOS } from '../utils/simulationEngine';
import { MessageSquare, Loader2 } from 'lucide-react';
import AIExplanation from './AIExplanation';

const SimulationPanel = ({
  nodes,
  edges,
  setNodes,
  selectedScenario,
  onScenarioSelect,
  isSimulating,
  setIsSimulating,
}) => {
  const [simulationLog, setSimulationLog] = useState([]);
  const [simulationResults, setSimulationResults] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const logEndRef = useRef(null);

  const scrollToBottom = () => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [simulationLog]);

  const addLog = (message) => {
    setSimulationLog((prev) => [...prev, { id: Date.now(), message, timestamp: new Date() }]);
  };

  const clearLog = () => {
    setSimulationLog([]);
    setSimulationResults(null);
  };

  const runSimulation = async () => {
    if (!selectedScenario || isSimulating) return;

    setIsSimulating(true);
    clearLog();
    setIsLoadingAI(false);
    addLog('Initializing simulation...');

    const logs = [];
    const addLogAndStore = (message) => {
      addLog(message);
      logs.push(message);
    };

    const { runScenario, calculateScore } = await import('../utils/simulationEngine');
    const results = await runScenario(selectedScenario.id, nodes, edges, setNodes, addLogAndStore);

    // Calculate resilience score
    const scoreResult = calculateScore(selectedScenario.id, nodes, edges, results);
    addLogAndStore(`\n📊 Resilience Score: ${scoreResult.score}/${scoreResult.maxScore} (${scoreResult.grade}) ${scoreResult.badge}`);
    if (scoreResult.feedback.length > 0) {
      scoreResult.feedback.forEach(fb => addLogAndStore(`   ${fb}`));
    }

    setSimulationResults({
      scenario: selectedScenario,
      message: results.message,
      success: results.success,
      logs: logs,
      score: scoreResult,
    });

    // Get AI explanation
    setIsLoadingAI(true);
    try {
      const { getAIExplanation, getFallbackExplanation } = await import('../utils/aiMentor');
      const aiResult = await getAIExplanation(nodes, selectedScenario, {
        logs: [...logs, results.message],
      }, edges);

      if (aiResult.error) {
        console.warn('AI explanation error:', aiResult.message);
        const fallback = getFallbackExplanation(selectedScenario, results, nodes, edges);
        setSimulationResults((prev) => ({
          ...prev,
          aiExplanation: fallback,
          aiError: true,
        }));
      } else {
        console.log('AI explanation received:', aiResult.explanation?.substring(0, 100));
        setSimulationResults((prev) => ({
          ...prev,
          aiExplanation: aiResult.explanation,
          aiError: false,
        }));
      }
    } catch (error) {
      console.error('Error getting AI explanation:', error);
      const { getFallbackExplanation } = await import('../utils/aiMentor');
      const fallback = getFallbackExplanation(selectedScenario, results, nodes, edges);
      setSimulationResults((prev) => ({
        ...prev,
        aiExplanation: fallback,
        aiError: true,
      }));
    } finally {
      setIsLoadingAI(false);
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    if (selectedScenario && !isSimulating) {
      clearLog();
    }
  }, [selectedScenario]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700 overflow-hidden">
      {/* Scenario Buttons */}
      <div className="p-4 border-b border-slate-700 flex-shrink-0 overflow-y-auto max-h-80">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">
          Disaster Scenarios
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(SCENARIOS).map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => onScenarioSelect(scenario)}
              disabled={isSimulating}
              className={`
                relative p-3 rounded-lg border-2 text-left transition-all
                ${
                  selectedScenario?.id === scenario.id
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                }
                ${isSimulating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="text-2xl mb-1">{scenario.icon}</div>
              <div className="text-xs font-semibold">{scenario.name}</div>
              <div className="text-xs text-slate-400 mt-1">{scenario.description}</div>
              {scenario.difficulty && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">
                    {scenario.difficulty}
                    {scenario.duration && ` • ${scenario.duration}`}
                  </span>
                </div>
              )}
              {selectedScenario?.id === scenario.id && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
        
        {selectedScenario && (
          <button
            onClick={runSimulation}
            disabled={isSimulating || nodes.length === 0}
            className={`
              w-full mt-4 px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
              ${
                isSimulating || nodes.length === 0
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg'
              }
            `}
          >
            {isSimulating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Running Simulation...
              </>
            ) : (
              `Run ${selectedScenario.name}`
            )}
          </button>
        )}
      </div>

      {/* Simulation Log */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="px-4 py-2 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Simulation Log
          </h3>
          {simulationLog.length > 0 && (
            <button
              onClick={clearLog}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto bg-black p-4 font-mono text-sm min-h-0" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 #1e293b' }}>
          {simulationLog.length === 0 ? (
            <div className="text-slate-500 italic">
              {selectedScenario
                ? 'Click "Run Simulation" to start...'
                : 'Select a scenario to begin'}
            </div>
          ) : (
            <div className="space-y-1">
              {simulationLog.map((log) => (
                <div key={log.id} className="text-green-400">
                  <span className="text-slate-500">[{log.timestamp.toLocaleTimeString()}]</span>{' '}
                  {log.message}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Resilience Score */}
      {simulationResults?.score && (
        <div className="border-t border-slate-700 p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              Resilience Score
            </h3>
            <div className={`text-2xl ${simulationResults.score.score >= 90 ? 'text-yellow-400' : simulationResults.score.score >= 70 ? 'text-gray-300' : simulationResults.score.score >= 50 ? 'text-orange-400' : 'text-red-400'}`}>
              {simulationResults.score.badge}
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Score</span>
              <span className="text-lg font-bold text-white">
                {simulationResults.score.score}/{simulationResults.score.maxScore}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  simulationResults.score.score >= 90
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                    : simulationResults.score.score >= 70
                    ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                    : simulationResults.score.score >= 50
                    ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                    : 'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                style={{ width: `${(simulationResults.score.score / simulationResults.score.maxScore) * 100}%` }}
              />
            </div>
            <div className="text-xs text-slate-300">
              Grade: <span className="font-semibold text-white">{simulationResults.score.grade}</span>
            </div>
          </div>
        </div>
      )}

      {/* AI Explanation */}
      <div className="border-t border-slate-700 flex-shrink-0 overflow-y-auto max-h-64">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              AI Mentor Explanation
            </h3>
          </div>
          {isLoadingAI ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              <span className="ml-2 text-slate-400">AI analyzing...</span>
            </div>
          ) : simulationResults?.aiExplanation ? (
            <AIExplanation
              explanation={simulationResults.aiExplanation}
              hasError={simulationResults.aiError}
            />
          ) : (
            <div className="bg-slate-800 rounded-lg p-4 text-slate-400 text-sm italic text-center">
              Run a simulation to get AI insights
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationPanel;

