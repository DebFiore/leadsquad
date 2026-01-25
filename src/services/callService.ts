// src/services/callService.ts

export const callService = {
  /**
   * Initiate an outbound call to a lead
   */
  async initiateCall(params: {
    organizationId: string;
    leadId: string;
    campaignId?: string;
    agentId?: string;
    phoneNumber: string;
  }) {
    const response = await fetch('/api/calls/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organization_id: params.organizationId,
        lead_id: params.leadId,
        campaign_id: params.campaignId,
        agent_id: params.agentId,
        phone_number: params.phoneNumber,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to initiate call');
    }

    return data;
  },

  /**
   * Check API health
   */
  async checkHealth() {
    const response = await fetch('/api/health');
    return response.json();
  },
};
