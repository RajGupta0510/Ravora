import re,io
def sub(path, pairs, imp=None):
    s=open(path,encoding='utf8').read()
    for a,b in pairs:
        assert a in s,(path,a[:50])
        s=s.replace(a,b,1)
    if imp and imp not in s:
        s=s.replace("import React", imp+"\nimport React",1) if False else s.replace("\n", "\n"+imp+"\n",1)
    open(path,'w',encoding='utf8').write(s)
base='src/components/dashboard/'
sub(base+'AppDashboard.tsx',[
("alert('Portfolio successfully rebalanced!');","toast.success('Portfolio rebalanced', { description: 'The recommended orders were executed in your sandbox.' });"),
("alert('Rebalancing order execution failed.');","toast.error('Rebalance failed', { description: 'The orders were not executed. Please try again.' });"),
("""    } catch (err) {
      console.error(err);
    } finally {
      setExecutingRecId(null);""","""    } catch (err) {
      console.error(err);
      toast.error('Rebalance failed', { description: 'Something went wrong. Please try again.' });
    } finally {
      setExecutingRecId(null);"""),
],"import { toast } from 'sonner';")
sub(base+'OnboardingWizard.tsx',[
("alert(res.error || 'Failed to complete onboarding. Please try again.');","toast.error('Setup could not be completed', { description: res.error || 'Please try again.' });"),
("alert(err.message || 'An unexpected error occurred.');","toast.error('Setup could not be completed', { description: err.message || 'An unexpected error occurred. Please try again.' });"),
],"import { toast } from 'sonner';")
sub(base+'OpportunitiesPanel.tsx',[
("alert(`Successfully deployed sandbox trade for ${selectedOpp.symbol}!`);","toast.success('Sandbox trade placed', { description: `${selectedOpp.symbol} was added to your open positions.` });"),
("alert('Failed to deploy sandbox trade.');","toast.error('Trade not placed', { description: 'The sandbox order was rejected. Check the size and leverage and try again.' });"),
("""      await scanMarkets();
    } catch (err) {
      console.error(err);""","""      await scanMarkets();
      toast.success('Scan complete', { description: 'Opportunities are up to date.' });
    } catch (err) {
      console.error(err);
      toast.error('Scan failed', { description: 'Could not reach the market scanner. Please try again.' });"""),
("""        setSelectedOpp(null);
      } else {""","""        setSelectedOpp(null);
      } else {"""),
("""    } catch (err) {
      console.error(err);
    } finally {
      setDeploying(false);""","""    } catch (err) {
      console.error(err);
      toast.error('Trade not placed', { description: 'Something went wrong. Please try again.' });
    } finally {
      setDeploying(false);"""),
],"import { toast } from 'sonner';")
sub(base+'PortfolioPanel.tsx',[
("""      await closePaperPosition(id);
    } catch (err) {
      console.error(err);""","""      const ok = await closePaperPosition(id);
      if (ok) toast.success('Position closed');
      else toast.error('Could not close position', { description: 'Please try again.' });
    } catch (err) {
      console.error(err);
      toast.error('Could not close position', { description: 'Please try again.' });"""),
("""      await closeAllPaperPositions();
    } catch (err) {
      console.error(err);""","""      const ok = await closeAllPaperPositions();
      if (ok) toast.success('All positions closed');
      else toast.error('Could not close all positions', { description: 'Some may still be open. Please try again.' });
    } catch (err) {
      console.error(err);
      toast.error('Could not close all positions', { description: 'Please try again.' });"""),
],"import { toast } from 'sonner';")
sub(base+'CopilotChat.tsx',[
("""    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);""","""    } catch (err) {
      console.error(err);
      toast.error('Message not sent', { description: 'Araiven could not respond. Please try again.' });
    } finally {
      setSending(false);"""),
],"import { toast } from 'sonner';")
sub('components/ui/auth-card.tsx',[
("toast.success('Password Reset Email Sent', { description: 'Your password has been successfully updated.' });","toast.success('Password updated', { description: 'Sign in with your new password.' });"),
])
