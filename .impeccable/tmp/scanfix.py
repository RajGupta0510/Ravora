p='src/context/AppContext.tsx'
s=open(p,encoding='utf8').read()
s=s.replace("scanMarkets: () => Promise<void>;","scanMarkets: () => Promise<boolean>;",1)
s=s.replace("""      if (res.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('[Market scan API error]', err);
    } finally {""","""      if (res.ok) {
        await fetchDashboardData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Market scan API error]', err);
      return false;
    } finally {""",1)
open(p,'w',encoding='utf8').write(s)
p='src/components/dashboard/OpportunitiesPanel.tsx'
s=open(p,encoding='utf8').read()
a="""      await scanMarkets();
      toast.success('Scan complete', { description: 'Opportunities are up to date.' });"""
b="""      const ok = await scanMarkets();
      if (ok) toast.success('Scan complete', { description: 'Opportunities are up to date.' });
      else toast.error('Scan failed', { description: 'Could not reach the market scanner. Please try again.' });"""
assert a in s
s=s.replace(a,b,1)
open(p,'w',encoding='utf8').write(s)
