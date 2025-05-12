<style>
.card-container {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
}
.card {
  flex: 1;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
  background: #fafafa;
  transition: box-shadow 0.2s;
  text-decoration: none;
  color: inherit;
}
.card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>

<div class="card-container ">
  <a class="card" href="/transfer">
    <h2>Transfer</h2>
    <p>Go to the transfer page</p>
    </a>
    <a class="card" href="/accounts">
        <h2>Accounts</h2>
        <p>Go to the accounts page</p>
    </a>
    <a class="card" href="/network">
        <h2>Network</h2>
        <p>The K8S network</p>
    </a>
    
</div>
